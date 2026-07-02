#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Detecta logos GolCraft em cada PDF e substitui pela CopaCraft no MESMO local
Analisa documento por documento
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

def detect_logos_in_image(img_array, logo_reference=None):
    """
    Detecta logos (areas com padroes de cor especificos)
    Procura por:
    - Areas brancas/pretas (padroes da logo GolCraft)
    - Formas circulares ou aproximadamente quadradas
    - Tamanho entre 30-150px
    """

    # Converter para HSV para melhor deteccao de cores
    if len(img_array.shape) == 3:
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    else:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)

    # Detectar cores da logo GolCraft (branco + preto + amarelo)
    # Branco
    lower_white = np.array([0, 0, 180])
    upper_white = np.array([180, 50, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)

    # Preto
    lower_black = np.array([0, 0, 0])
    upper_black = np.array([180, 255, 80])
    mask_black = cv2.inRange(hsv, lower_black, upper_black)

    # Combinar mascaras
    mask = cv2.bitwise_or(mask_white, mask_black)

    # Aplicar morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # Encontrar contornos
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    logo_positions = []

    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h

        # Filtrar por tamanho (logos devem ter tamanho consistente)
        # Logos sao aproximadamente quadradas
        if 800 < area < 25000 and 0.6 < w/h < 1.4:
            # Verificar se tem conteudo (nao eh so borda)
            aspect_ratio = float(w) / h
            if 0.7 < aspect_ratio < 1.3:
                logo_positions.append({
                    'x': x,
                    'y': y,
                    'w': w,
                    'h': h,
                    'area': area,
                    'center_x': x + w//2,
                    'center_y': y + h//2
                })

    return logo_positions

def replace_logos_intelligent(pdf_path, logo_path, output_dir):
    """Detecta e substitui logos inteligentemente"""

    basename = os.path.basename(pdf_path)
    print(f"\n[ANALISANDO] {basename}")

    try:
        pdf_doc = fitz.open(pdf_path)
        num_pages = len(pdf_doc)
        print(f"[PAGINAS] {num_pages}")

        # Carregar nova logo
        logo_img_original = Image.open(logo_path).convert("RGBA")

        processed_pages = []
        total_logos_found = 0
        total_logos_replaced = 0

        for page_num in range(num_pages):
            page = pdf_doc[page_num]

            # Converter para imagem (150 DPI)
            pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
            img_data = pix.tobytes("png")
            page_img = Image.open(io.BytesIO(img_data)).convert("RGB")

            # Converter para array numpy para deteccao
            img_array = np.array(page_img)

            # Detectar logos
            logos = detect_logos_in_image(img_array)

            if logos:
                print(f"  Pagina {page_num + 1}: {len(logos)} logo(s) detectada(s)", end="")

                # Converter para RGBA para poder colar
                page_img_rgba = page_img.convert("RGBA")

                # Para cada logo detectada, substituir
                replaced = 0
                for logo_info in logos:
                    x, y, w, h = logo_info['x'], logo_info['y'], logo_info['w'], logo_info['h']

                    # Redimensionar nova logo para o tamanho exato
                    logo_resized = logo_img_original.resize((w, h), Image.Resampling.LANCZOS)

                    # Colar no mesmo lugar
                    page_img_rgba.paste(logo_resized, (x, y), logo_resized)
                    replaced += 1
                    total_logos_replaced += 1

                total_logos_found += len(logos)
                print(f" -> {replaced} substituida(s)")
            else:
                print(f"  Pagina {page_num + 1}: nenhuma logo detectada")
                page_img_rgba = page_img.convert("RGBA")

            processed_pages.append(page_img_rgba.convert("RGB"))

        pdf_doc.close()

        # Salvar PDF
        output_name = Path(pdf_path).stem + " - CopaCraft.pdf"
        output_path = os.path.join(output_dir, output_name)

        print(f"[SALVANDO] {output_name}...")
        processed_pages[0].save(
            output_path,
            save_all=True,
            append_images=processed_pages[1:],
            quality=95
        )

        file_size_mb = os.path.getsize(output_path) / (1024*1024)
        print(f"[OK] {total_logos_replaced} logos substituidas | {file_size_mb:.1f} MB")

        return True, total_logos_replaced

    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
        return False, 0

def main():
    if len(sys.argv) < 3:
        print("Uso: python detect_and_replace_logos.py <PASTA_PDF> <LOGO>")
        sys.exit(1)

    input_path = sys.argv[1]
    logo_path = sys.argv[2]
    output_dir = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"

    if not os.path.exists(input_path):
        print(f"[ERRO] Caminho nao encontrado: {input_path}")
        sys.exit(1)

    if not os.path.exists(logo_path):
        print(f"[ERRO] Logo nao encontrada: {logo_path}")
        sys.exit(1)

    if os.path.isdir(input_path):
        pdfs = sorted(list(Path(input_path).glob("*.pdf")))
        if not pdfs:
            print(f"[AVISO] Nenhum PDF em: {input_path}")
            sys.exit(1)

        print(f"[INICIANDO] Analise de {len(pdfs)} PDFs")
        print(f"[MODO] Deteccao automatica de logos em cada documento\n")

        success = 0
        total_replaced = 0
        for pdf_file in pdfs:
            ok, count = replace_logos_intelligent(str(pdf_file), logo_path, output_dir)
            if ok:
                success += 1
                total_replaced += count

        print(f"\n[RESULTADO FINAL]")
        print(f"  Arquivos processados: {success}/{len(pdfs)}")
        print(f"  Total de logos substituidas: {total_replaced}")
        print(f"  Saida: {output_dir}")
    else:
        print("[MODO] Deteccao automatica de logos\n")
        replace_logos_intelligent(input_path, logo_path, output_dir)

if __name__ == "__main__":
    main()
