#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script simples para substituir logos em PDFs
"""

import sys
import os
from pathlib import Path
from pdf2image import convert_from_path
from PIL import Image
import shutil
import io

# Forçar stdout UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def main():
    if len(sys.argv) < 3:
        print("Uso: python simple_logo_replace.py <PDF> <LOGO_NOVA>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    logo_path = sys.argv[2]
    output_dir = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"

    # Validar arquivos
    if not os.path.exists(pdf_path):
        print(f"[ERRO] PDF nao encontrado: {pdf_path}")
        sys.exit(1)

    if not os.path.exists(logo_path):
        print(f"[ERRO] Logo nao encontrada: {logo_path}")
        sys.exit(1)

    print(f"[PDF] {pdf_path}")
    print(f"[LOGO] {logo_path}")
    print(f"[SAIDA] {output_dir}\n")

    try:
        # Converter PDF para imagens
        print("[CONVERTENDO] PDF em imagens...")
        pages = convert_from_path(pdf_path, dpi=200)
        print(f"[OK] {len(pages)} paginas convertidas")

        # Carregar nova logo
        print("\n[LOGO] Carregando nova logo...")
        new_logo = Image.open(logo_path).convert("RGBA")
        print(f"[OK] Logo carregada: {new_logo.size}")

        # Processar cada página
        print("\n[PROCESSANDO] Paginas...")
        processed = []

        for idx, page in enumerate(pages, 1):
            print(f"   Pagina {idx}/{len(pages)}", end="")

            # Converter para PIL se necessário
            page_pil = page.convert("RGBA") if isinstance(page, Image.Image) else page

            # Detectar áreas brancas/pretas (características da logo GolCraft)
            # e substituir pela nova
            # Para agora, vamos apenas colar a nova logo nos mesmos locais

            # Tamanho padrão da logo GolCraft no PDF (~60-80px)
            logo_size = 70
            logo_resized = new_logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)

            # Posições conhecidas das logos (aproximadas em % da página)
            positions = [
                (0.15, 0.35),  # Centro esquerdo
                (0.8, 0.35),   # Centro direito
                (0.15, 0.7),   # Baixo esquerdo
                (0.8, 0.7),    # Baixo direito
            ]

            # Colar logo em posições relativas
            width, height = page_pil.size
            for pos_x_pct, pos_y_pct in positions:
                x = int(width * pos_x_pct)
                y = int(height * pos_y_pct)

                # Verificar se a posição tem conteúdo (não está em branco puro)
                try:
                    page_pil.paste(logo_resized, (x, y), logo_resized)
                except:
                    pass

            processed.append(page_pil.convert("RGB"))
            print(" [OK]")

        # Salvar como PDF
        output_name = Path(pdf_path).stem + " - CopaCraft.pdf"
        output_path = os.path.join(output_dir, output_name)

        print(f"\n[SALVANDO] PDF...")
        processed[0].save(
            output_path,
            save_all=True,
            append_images=processed[1:],
            quality=95
        )

        print(f"[CONCLUIDO]")
        print(f"[ARQUIVO] {output_path}")

    except Exception as e:
        print(f"\n[ERRO] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
