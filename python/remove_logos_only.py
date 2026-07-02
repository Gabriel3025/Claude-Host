#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove logos GolCraft do PDF - deixa branco no lugar
Analisa folha por folha, calcula exatamente onde estao e remove
"""

import sys
import os
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image, ImageDraw
import io
import numpy as np
import cv2

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def detect_logos_precise(img_array):
    """
    Detecta logos com PRECISAO
    Retorna lista com posicoes exatas de cada logo encontrada
    """

    # Converter para HSV
    if len(img_array.shape) == 3:
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    else:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)

    # Detectar branco + preto (cores predominantes da logo GolCraft)
    lower_white = np.array([0, 0, 180])
    upper_white = np.array([180, 50, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)

    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 80])
    mask_black = cv2.inRange(hsv, lower_black, upper_black)

    mask = cv2.bitwise_or(mask_white, mask_black)

    # Morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # Encontrar contornos
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    logo_positions = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h

        # Logos sao aprox quadradas, tamanho especifico
        if 800 < area < 25000 and 0.6 < w/h < 1.4:
            aspect_ratio = float(w) / h
            if 0.7 < aspect_ratio < 1.3:
                logo_positions.append({
                    'x': int(x),
                    'y': int(y),
                    'w': int(w),
                    'h': int(h),
                    'area': area
                })

    return logo_positions

def remove_logos_from_pdf(pdf_path, output_path):
    """Remove todas as logos, deixando branco no lugar"""

    print(f"[ABRINDO] {os.path.basename(pdf_path)}")

    try:
        pdf_doc = fitz.open(pdf_path)
        num_pages = len(pdf_doc)
        print(f"[PAGINAS] {num_pages}\n")

        processed_pages = []
        total_logos_removed = 0

        for page_num in range(num_pages):
            page = pdf_doc[page_num]

            # Converter para imagem
            pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
            img_data = pix.tobytes("png")
            page_img = Image.open(io.BytesIO(img_data)).convert("RGB")

            # Converter para array numpy para deteccao
            img_array = np.array(page_img)

            # Detectar logos
            logos = detect_logos_precise(img_array)

            print(f"[FOLHA {page_num + 1}]", end="")

            if logos:
                print(f" {len(logos)} logo(s) encontrada(s)")

                # Converter para PIL e remover as logos
                page_img_pil = page_img.convert("RGB")
                draw = ImageDraw.Draw(page_img_pil)

                for logo_info in logos:
                    x, y, w, h = logo_info['x'], logo_info['y'], logo_info['w'], logo_info['h']

                    # Preencher area com branco
                    draw.rectangle([x, y, x+w, y+h], fill='white')

                    print(f"  -> Logo removida: posicao ({x}, {y}) tamanho {w}x{h}px")
                    total_logos_removed += 1

                processed_pages.append(page_img_pil)
            else:
                print(" (nenhuma logo)")
                processed_pages.append(page_img)

        pdf_doc.close()

        # Salvar PDF
        print(f"\n[SALVANDO] {os.path.basename(output_path)}...")

        if processed_pages:
            processed_pages[0].save(
                output_path,
                save_all=True,
                append_images=processed_pages[1:] if len(processed_pages) > 1 else [],
                quality=95
            )

        file_size_mb = os.path.getsize(output_path) / (1024*1024)
        print(f"\n[CONCLUIDO]")
        print(f"  Total de logos removidas: {total_logos_removed}")
        print(f"  Arquivo salvo: {output_path}")
        print(f"  Tamanho: {file_size_mb:.1f} MB")

        return True

    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    if len(sys.argv) < 2:
        print("Uso: python remove_logos_only.py <PDF>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"

    if not os.path.exists(pdf_path):
        print(f"[ERRO] PDF nao encontrado: {pdf_path}")
        sys.exit(1)

    # Gerar caminho de saida
    output_name = Path(pdf_path).stem + " - SEM LOGOS.pdf"
    output_path = os.path.join(output_dir, output_name)

    print("[MODO] Remocao de logos (deixa branco no lugar)\n")
    remove_logos_from_pdf(pdf_path, output_path)

if __name__ == "__main__":
    main()
