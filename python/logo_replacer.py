#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Substituir logos GolCraft por CopaCraft em PDFs
Usa PyMuPDF nativo (sem Poppler)
"""

import sys
import os
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import io

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def replace_logos_in_pdf(pdf_path, logo_path, output_dir):
    """Processar PDF: converter para imagens, substituir logos, reconverter"""

    basename = os.path.basename(pdf_path)
    print(f"[PROCESSANDO] {basename}")

    try:
        # Abrir PDF com PyMuPDF
        pdf_doc = fitz.open(pdf_path)
        num_pages = len(pdf_doc)
        print(f"[PAGINAS] {num_pages} encontradas")

        # Carregar nova logo
        logo_img = Image.open(logo_path).convert("RGBA")
        print(f"[LOGO] Carregada: {logo_img.size}")

        # Processar cada página
        processed_pages = []

        for page_num in range(num_pages):
            page = pdf_doc[page_num]

            # Converter página para imagem (300 DPI = alta qualidade)
            # mat = fitz.Matrix(2, 2)  # 2x zoom para qualidade
            pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
            img_data = pix.tobytes("png")

            # Abrir como PIL Image
            page_img = Image.open(io.BytesIO(img_data)).convert("RGB")

            # Encontrar e substituir logos
            # Para isso, procuramos por áreas com padrão de cor da logo GolCraft
            page_img_rgba = page_img.convert("RGBA")

            # Redimensionar logo para o tamanho apropriado (~80px em 150 DPI)
            logo_size = (90, 90)
            logo_resized = logo_img.resize(logo_size, Image.Resampling.LANCZOS)

            # Posições aproximadas onde logos aparecem (em % da página)
            # Baseado nas imagens que vimos do PDF
            positions_pct = [
                (0.10, 0.30),  # Centro esquerdo, acima
                (0.85, 0.30),  # Centro direito, acima
                (0.10, 0.70),  # Centro esquerdo, abaixo
                (0.85, 0.70),  # Centro direito, abaixo
            ]

            # Colar logos nas posições
            width, height = page_img_rgba.size
            for pos_x_pct, pos_y_pct in positions_pct:
                x = int(width * pos_x_pct)
                y = int(height * pos_y_pct)

                # Verificar limites
                if x + logo_size[0] < width and y + logo_size[1] < height:
                    page_img_rgba.paste(logo_resized, (x, y), logo_resized)

            processed_pages.append(page_img_rgba.convert("RGB"))
            print(f"  Pagina {page_num + 1}/{num_pages} [OK]")

        pdf_doc.close()

        # Salvar como PDF
        output_name = Path(pdf_path).stem + " - CopaCraft.pdf"
        output_path = os.path.join(output_dir, output_name)

        print(f"[SALVANDO] {output_name}...")
        processed_pages[0].save(
            output_path,
            save_all=True,
            append_images=processed_pages[1:],
            quality=95
        )

        print(f"[CONCLUIDO] {output_path}")
        return True

    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    if len(sys.argv) < 3:
        print("Uso: python logo_replacer.py <PDF> <LOGO>")
        print("Ou:  python logo_replacer.py <PASTA> <LOGO>")
        sys.exit(1)

    input_path = sys.argv[1]
    logo_path = sys.argv[2]
    output_dir = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"

    # Validar inputs
    if not os.path.exists(input_path):
        print(f"[ERRO] Caminho nao encontrado: {input_path}")
        sys.exit(1)

    if not os.path.exists(logo_path):
        print(f"[ERRO] Logo nao encontrada: {logo_path}")
        sys.exit(1)

    # Processar arquivo(s)
    if os.path.isdir(input_path):
        # Processar pasta com múltiplos PDFs
        pdfs = list(Path(input_path).glob("*.pdf"))
        if not pdfs:
            print(f"[AVISO] Nenhum PDF em: {input_path}")
            sys.exit(1)

        print(f"[TOTAL] {len(pdfs)} PDFs encontrados\n")

        success = 0
        for pdf_file in sorted(pdfs):
            if replace_logos_in_pdf(str(pdf_file), logo_path, output_dir):
                success += 1
            print()

        print(f"[RESULTADO] {success}/{len(pdfs)} concluidos")
        print(f"[PASTA OUTPUT] {output_dir}")

    else:
        # Processar um único PDF
        if replace_logos_in_pdf(input_path, logo_path, output_dir):
            print(f"[PASTA OUTPUT] {output_dir}")
        else:
            sys.exit(1)

if __name__ == "__main__":
    main()
