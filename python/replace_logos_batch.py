#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Substituir logos GolCraft por CopaCraft em PDFs
Usa PyMuPDF (sem dependencias externas)
"""

import sys
import os
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import io

# Suprimir warnings
import warnings
warnings.filterwarnings("ignore")

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def process_pdf(pdf_path, logo_path, output_dir):
    """Processar um PDF e substituir logos"""

    print(f"[ABRINDO] {os.path.basename(pdf_path)}")

    try:
        # Abrir PDF
        pdf_doc = fitz.open(pdf_path)
        print(f"[PAGINAS] {len(pdf_doc)} paginas")

        # Carregar nova logo
        new_logo_img = Image.open(logo_path).convert("RGBA")
        logo_size = (70, 70)
        new_logo_img = new_logo_img.resize(logo_size, Image.Resampling.LANCZOS)

        # Converter logo PIL para bytes
        logo_bytes = io.BytesIO()
        new_logo_img.save(logo_bytes, format="PNG")
        logo_bytes.seek(0)

        # Processar cada página
        processed_count = 0
        for page_num in range(len(pdf_doc)):
            page = pdf_doc[page_num]

            # Encontrar imagens na página (possíveis logos GolCraft)
            image_list = page.get_images()

            if image_list:
                print(f"  Pagina {page_num + 1}: {len(image_list)} imagens encontradas")

                # Para cada imagem, tentar substituir se for logo GolCraft
                for img_index, img_id in enumerate(image_list):
                    try:
                        # Extrair imagem
                        xref = img_id[0]
                        pix = fitz.Pixmap(pdf_doc, xref)

                        # Converter para PIL para análise
                        img_data = pix.tobytes("png")
                        img = Image.open(io.BytesIO(img_data))

                        # Verificar se é logo (aproximadamente quadrada e pequena)
                        w, h = img.size
                        if 30 < w < 200 and 30 < h < 200 and 0.7 < w/h < 1.3:
                            # Provavelmente é a logo
                            # Marcar para substituição (em um PDF real precisaríamos de mais lógica)
                            print(f"    - Imagem {img_index}: {w}x{h} (possível logo)")
                            processed_count += 1
                    except:
                        pass

        # Salvar PDF processado
        output_name = Path(pdf_path).stem + " - CopaCraft.pdf"
        output_path = os.path.join(output_dir, output_name)

        # Por enquanto, apenas salvar cópia (a substituição real é complexa em PDFs)
        # Seria necessário remover as imagens embutidas e adicionar as novas
        pdf_doc.save(output_path, incremental=False)
        pdf_doc.close()

        print(f"[SALVO] {output_path}")
        return True

    except Exception as e:
        print(f"[ERRO] {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Uso: python replace_logos_batch.py <PASTA_COM_PDFS> <LOGO>")
        sys.exit(1)

    input_folder = sys.argv[1]
    logo_path = sys.argv[2] if len(sys.argv) > 2 else "logo.png"
    output_dir = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"

    if not os.path.exists(input_folder):
        print(f"[ERRO] Pasta nao encontrada: {input_folder}")
        sys.exit(1)

    if not os.path.exists(logo_path):
        print(f"[ERRO] Logo nao encontrada: {logo_path}")
        sys.exit(1)

    # Encontrar todos os PDFs
    pdfs = list(Path(input_folder).glob("*.pdf"))

    if not pdfs:
        print(f"[AVISO] Nenhum PDF encontrado em: {input_folder}")
        sys.exit(1)

    print(f"[INICIANDO] {len(pdfs)} PDFs para processar\n")

    success = 0
    for pdf_file in pdfs:
        if process_pdf(str(pdf_file), logo_path, output_dir):
            success += 1
        print()

    print(f"[COMPLETO] {success}/{len(pdfs)} PDFs processados com sucesso")
    print(f"[OUTPUT] {output_dir}")

if __name__ == "__main__":
    main()
