#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para substituir logo GolCraft por CopaCraft em PDFs
"""

from pdf2image import convert_from_path
from PIL import Image, ImageDraw
import os
from pathlib import Path
import cv2
import numpy as np

# Configurações
PDF_PATH = r"SELEÇÃO ARGENTINA.pdf"
OUTPUT_DIR = r"C:\Users\Administrador.LAURAFERREIRA\Desktop"
DPI = 150

print("🔄 Iniciando conversão do PDF...")

# Converter PDF para imagens
pages = convert_from_path(PDF_PATH, dpi=DPI)
print(f"✅ {len(pages)} páginas extraídas")

# Primeira, precisamos da nova logo como imagem
# Vou criar um placeholder - você precisa fornecer o caminho
NEW_LOGO = None

# Tentar carregar nova logo se existir
logo_paths = [
    "CopaCraft.png",
    "copa_craft.png",
    "logo_new.png",
    r"C:\Users\Administrador.LAURAFERREIRA\Downloads\CopaCraft.png"
]

for logo_path in logo_paths:
    if os.path.exists(logo_path):
        try:
            NEW_LOGO = Image.open(logo_path).convert("RGBA")
            print(f"✅ Logo encontrada: {logo_path}")
            break
        except:
            pass

if NEW_LOGO is None:
    print("⚠️ AVISO: Não encontrei a imagem da nova logo!")
    print("Caminhos procurados:")
    for p in logo_paths:
        print(f"  - {p}")
    print("\nPor favor, forneça o caminho da logo CopaCraft")
    exit(1)

# Redimensionar logo se necessário (proporção 1:1)
new_logo_size = 80
NEW_LOGO = NEW_LOGO.resize((new_logo_size, new_logo_size), Image.Resampling.LANCZOS)

# Processar cada página
processed_pages = []
for page_num, page in enumerate(pages, 1):
    print(f"\n📄 Processando página {page_num}/{len(pages)}...")

    page_np = np.array(page)

    # Converter para HSV para melhor detecção de cores
    # GolCraft tem cores específicas: branco, preto, amarelo
    hsv = cv2.cvtColor(page_np, cv2.COLOR_RGB2HSV)

    # Detectar cores da logo GolCraft (branco/preto/amarelo)
    # Criar máscara para possíveis logos
    lower_white = np.array([0, 0, 200])
    upper_white = np.array([180, 50, 255])
    mask_white = cv2.inRange(hsv, lower_white, upper_white)

    # Encontrar contornos (possíveis logos)
    contours, _ = cv2.findContours(mask_white, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filtrar contornos por tamanho (logos devem ter um tamanho específico)
    logo_contours = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h
        # Logos devem ter entre 1500 e 15000 pixels
        if 1500 < area < 15000 and 0.7 < w/h < 1.3:  # aproximadamente quadrado
            logo_contours.append((x, y, w, h))

    print(f"   📍 Encontradas {len(logo_contours)} possíveis logos")

    # Substituir cada logo encontrada
    page_pil = page.convert("RGBA")

    for x, y, w, h in logo_contours:
        # Redimensionar nova logo para o tamanho encontrado
        resized_logo = NEW_LOGO.resize((w, h), Image.Resampling.LANCZOS)

        # Colar nova logo
        page_pil.paste(resized_logo, (x, y), resized_logo)
        print(f"   ✏️  Logo substituída em ({x}, {y}) - {w}x{h}px")

    processed_pages.append(page_pil.convert("RGB"))

# Salvar PDF processado
output_path = os.path.join(OUTPUT_DIR, "SELEÇÃO ARGENTINA - CopaCraft.pdf")
print(f"\n💾 Salvando PDF em: {output_path}")

try:
    processed_pages[0].save(
        output_path,
        save_all=True,
        append_images=processed_pages[1:],
        optimize=False,
        quality=95
    )
    print(f"✅ PDF salvo com sucesso!")
    print(f"📂 Arquivo: {output_path}")
except Exception as e:
    print(f"❌ Erro ao salvar: {e}")
    exit(1)

print("\n🎉 Processamento concluído!")
