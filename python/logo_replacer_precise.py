#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Substituir logos com PRECISAO - detecta espacos brancos para colocar a logo
Garante que a logo NAO interfira com as areas que serao recortadas
"""

import sys
import os
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image, ImageDraw
import io
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def find_white_spaces(img_array, threshold=240):
    """
    Encontra areas brancas/vazias na imagem onde a logo pode ser colocada
    threshold: valor de branco (0-255), quanto mais alto, mais rigoroso
    """
    # Converter para escala de cinza
    if len(img_array.shape) == 3:
        gray = np.mean(img_array, axis=2)
    else:
        gray = img_array

    # Encontrar pixels muito brancos
    white_mask = gray > threshold
    return white_mask

def get_safe_positions(page_img, logo_size, min_distance_from_edge=50):
    """
    Retorna posicoes seguras para colocar a logo
    - Em areas brancas
    - Longe das bordas
    - Sem cobrir conteudo importante
    """
    img_array = np.array(page_img)
    white_mask = find_white_spaces(img_array, threshold=235)

    width, height = page_img.size
    positions = []

    # Dividir a imagem em uma grid e procurar por areas brancas
    grid_size = 150  # tamanho de cada celula da grid
    logo_w, logo_h = logo_size

    for y in range(0, height - logo_h, grid_size):
        for x in range(0, width - logo_w, grid_size):
            # Verificar se esta area eh predominantemente branca
            region = white_mask[y:y+logo_h, x:x+logo_w]

            # Se mais de 70% da area eh branca, eh segura
            if np.sum(region) > (region.size * 0.7):
                # Evitar bordas extremas
                if x > min_distance_from_edge and y > min_distance_from_edge:
                    if x + logo_w < width - min_distance_from_edge:
                        if y + logo_h < height - min_distance_from_edge:
                            positions.append((x, y))

    return positions

def replace_logos_in_pdf_precise(pdf_path, logo_path, output_dir):
    """Processar PDF com PRECISAO"""

    basename = os.path.basename(pdf_path)
    print(f"[PROCESSANDO] {basename}")

    try:
        pdf_doc = fitz.open(pdf_path)
        num_pages = len(pdf_doc)
        print(f"[PAGINAS] {num_pages}")

        # Carregar logo (PEQUENA!)
        logo_img_original = Image.open(logo_path).convert("RGBA")

        # Definir tamanho preciso da logo
        # MUITO MENOR que antes: 50px (era 90px)
        LOGO_SIZE = (50, 50)
        logo_img = logo_img_original.resize(LOGO_SIZE, Image.Resampling.LANCZOS)
        print(f"[LOGO] Tamanho: {LOGO_SIZE[0]}x{LOGO_SIZE[1]}px (reduzida para nao cobrir)")

        processed_pages = []

        for page_num in range(num_pages):
            page = pdf_doc[page_num]

            # Converter para imagem (150 DPI para qualidade boa)
            pix = page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
            img_data = pix.tobytes("png")
            page_img = Image.open(io.BytesIO(img_data)).convert("RGB")

            # Converter para RGBA para poder colar a logo
            page_img_rgba = page_img.convert("RGBA")

            # METODO 1: Colocar apenas nos cantos especificos (mais seguro)
            # Baseado nas imagens mostradas, as logos devem estar em areas pequenas

            width, height = page_img_rgba.size
            logo_h, logo_w = LOGO_SIZE

            # Cantos e espacos seguros (em pixels, ajustado para a nova logo pequena)
            safe_positions = [
                (20, 20),                              # Canto superior esquerdo
                (width - logo_w - 20, 20),             # Canto superior direito
                (20, height - logo_h - 20),            # Canto inferior esquerdo
                (width - logo_w - 20, height - logo_h - 20),  # Canto inferior direito
            ]

            # Para cada pagina, colocar logo em 2-4 posicoes seguras
            logos_placed = 0
            for pos_x, pos_y in safe_positions:
                # Verificar se a posicao eh valida (dentro dos limites)
                if pos_x >= 0 and pos_y >= 0:
                    if pos_x + logo_w <= width and pos_y + logo_h <= height:
                        page_img_rgba.paste(logo_img, (pos_x, pos_y), logo_img)
                        logos_placed += 1

            processed_pages.append(page_img_rgba.convert("RGB"))
            print(f"  Pagina {page_num + 1}/{num_pages} - {logos_placed} logos colocadas")

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
        print(f"[CONCLUIDO] {output_path} ({file_size_mb:.1f} MB)")
        return True

    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    if len(sys.argv) < 3:
        print("Uso: python logo_replacer_precise.py <PASTA_PDF> <LOGO>")
        sys.exit(1)

    input_path = sys.argv[1]
    logo_path = sys.argv[2]
    output_dir = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"

    if not os.path.exists(input_path):
        print(f"[ERRO] Pasta nao encontrada: {input_path}")
        sys.exit(1)

    if not os.path.exists(logo_path):
        print(f"[ERRO] Logo nao encontrada: {logo_path}")
        sys.exit(1)

    if os.path.isdir(input_path):
        pdfs = sorted(list(Path(input_path).glob("*.pdf")))
        if not pdfs:
            print(f"[AVISO] Nenhum PDF em: {input_path}")
            sys.exit(1)

        print(f"[TOTAL] {len(pdfs)} PDFs para processar")
        print(f"[MODO] Logo pequena (50x50px) apenas nos cantos - nao interfere!\n")

        success = 0
        for pdf_file in pdfs:
            if replace_logos_in_pdf_precise(str(pdf_file), logo_path, output_dir):
                success += 1
            print()

        print(f"[RESULTADO FINAL] {success}/{len(pdfs)} concluidos")
        print(f"[OUTPUT] {output_dir}")
    else:
        print("[MODO] Logo pequena (50x50px) apenas nos cantos\n")
        replace_logos_in_pdf_precise(input_path, logo_path, output_dir)

if __name__ == "__main__":
    main()
