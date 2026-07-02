#!/usr/bin/env python3
"""
Coleta Robusta — Facebook Ads Library
Coletam anúncios ativos para cada produto
Saída: coleta_python.json
"""
import asyncio
import json
import sys
from datetime import datetime
from playwright.async_api import async_playwright

# Produtos com rowIdx, nome e URL da Facebook Ads Library
PRODUTOS = [
    {"rowIdx": 1, "nome": "Atividade cursiva", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all"},
    {"rowIdx": 8, "nome": "Jiujistu", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
    {"rowIdx": 12, "nome": "Alfabetização", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
    {"rowIdx": 20, "nome": "Pacotes de músicas", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038"},
    {"rowIdx": 21, "nome": "200 dinamicas cristã", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027"},
    {"rowIdx": 24, "nome": "Croche", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1232138571920008&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445"},
    {"rowIdx": 26, "nome": "Ebook bibílico", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
    {"rowIdx": 27, "nome": "Ficha de Treino", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
    {"rowIdx": 28, "nome": "1.200 Moldes", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848"},
    {"rowIdx": 29, "nome": "Exerc. Anatomia", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
    {"rowIdx": 30, "nome": "100 Brincadeiras", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo"},
    {"rowIdx": 31, "nome": "Moldes FOAM", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415"},
    {"rowIdx": 32, "nome": "Organização", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343"},
    {"rowIdx": 33, "nome": "DryWall", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593"},
    {"rowIdx": 34, "nome": "Tarot", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050"},
    {"rowIdx": 35, "nome": "Plantar", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
    {"rowIdx": 36, "nome": "Neuropro", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469"},
    {"rowIdx": 37, "nome": "120 dinamicas", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684"},
    {"rowIdx": 38, "nome": "Moldes EVA", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335"},
    {"rowIdx": 39, "nome": "Airfryer", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604"},
    {"rowIdx": 40, "nome": "Saude", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107"},
    {"rowIdx": 41, "nome": "Emagrecimento", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306"},
    {"rowIdx": 42, "nome": "Cards", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814"},
    {"rowIdx": 43, "nome": "Capivarinha", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901"},
    {"rowIdx": 44, "nome": "JiuJistsu LATAM", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585"},
    {"rowIdx": 45, "nome": "Casinhas", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=894236146555718&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=889932910880439"},
    {"rowIdx": 46, "nome": "Figurinhas", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1286271340269388&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=520638794477144"},
    {"rowIdx": 47, "nome": "Fichas", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4299287350328499&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104104989446273"},
    {"rowIdx": 48, "nome": "Marcenaria", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=633981863122900"},
    {"rowIdx": 49, "nome": "Bijuteria", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=866928149845118"},
    {"rowIdx": 50, "nome": "Alfa 2", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=292286153965893"},
    {"rowIdx": 51, "nome": "Creme", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1030626216804522"},
    {"rowIdx": 52, "nome": "Copa", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179"},
    {"rowIdx": 53, "nome": "Calistenia", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687"},
    {"rowIdx": 54, "nome": "Religião", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=402138022974258"},
    {"rowIdx": 55, "nome": "Dinamicas", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=519466767912828"},
    {"rowIdx": 56, "nome": "Leiturinha", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347"},
    {"rowIdx": 57, "nome": "Anatomia", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=910225638850949"},
    {"rowIdx": 58, "nome": "Cafajeste", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848"},
    {"rowIdx": 59, "nome": "Sono", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1011693332027445"},
    {"rowIdx": 60, "nome": "Painel", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150"},
    {"rowIdx": 61, "nome": "PTBR", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215"},
    {"rowIdx": 62, "nome": "Planilha", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839"},
    {"rowIdx": 63, "nome": "Pro", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150"},
    {"rowIdx": 64, "nome": "Cal 2", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687"},
    {"rowIdx": 65, "nome": "Português", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410"},
    {"rowIdx": 66, "nome": "2º ano", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190"},
    {"rowIdx": 67, "nome": "Figurinha", "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877"}
]

def log(msg):
    """Print com timestamp"""
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

async def coletar():
    """Coleta anúncios de todos os produtos"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        log(f"Iniciando coleta de {len(PRODUTOS)} produtos...")
        log("")

        resultados = []
        erros = []
        sucesso_count = 0

        for i, prod in enumerate(PRODUTOS, 1):
            idx = prod['rowIdx']
            nome = prod['nome']
            print(f"[{i:2d}/{len(PRODUTOS)}] {nome:<35}", end="", flush=True)

            try:
                # Navegar para URL
                await page.goto(prod['url'], wait_until='networkidle', timeout=40000)

                # Fechar popups
                await page.keyboard.press('Escape')
                await page.wait_for_timeout(1500)

                # Extrair texto
                texto = await page.inner_text('body')

                # Procurar padrão de contagem de anúncios
                import re
                match = re.search(r'[~≈]?\s*(\d+(?:[.,]\d+)*)\s+resultados?', texto, re.IGNORECASE)

                valor = 0
                if match:
                    valor_str = match.group(1).replace('.', '').replace(',', '')
                    valor = int(valor_str)
                elif re.search(r'Nenhum anuncio|No ads|sem resultados', texto, re.IGNORECASE):
                    valor = 0

                # Validar valor coletado
                if valor < 0 or valor > 1000:
                    raise ValueError(f"Valor invalido: {valor}")

                resultados.append({
                    "rowIdx": idx,
                    "colDia": 6,
                    "valor": valor,
                    "produto": nome
                })

                print(f" OK {valor} anuncios")
                sucesso_count += 1

            except Exception as e:
                print(f" ERRO ({str(e)[:30]})")
                erros.append({"rowIdx": idx, "produto": nome, "erro": str(e)})
                resultados.append({
                    "rowIdx": idx,
                    "colDia": 6,
                    "valor": None,
                    "produto": nome
                })

            # Aguardar entre requisições
            if i % 10 == 0:
                await page.wait_for_timeout(3000)

        await browser.close()

        # Salvar resultados
        with open('coleta_python.json', 'w', encoding='utf-8') as f:
            json.dump(resultados, f, indent=2, ensure_ascii=False)

        # Relatar resumo
        log("")
        log(f"[OK] Coleta finalizada: {sucesso_count}/{len(PRODUTOS)} produtos")

        if erros:
            log(f"[!] {len(erros)} erros durante coleta")

        # Validações finais
        with_valor = [r for r in resultados if r['valor'] is not None]
        total_anuncios = sum(r['valor'] for r in with_valor)

        log(f"[*] Total de anuncios coletados: {total_anuncios}")
        log(f"[*] Arquivo salvo: coleta_python.json")
        log("")

        # Retornar sucesso se 95%+ foram coletados
        if sucesso_count / len(PRODUTOS) >= 0.95:
            return True
        else:
            return False

if __name__ == "__main__":
    try:
        success = asyncio.run(coletar())
        sys.exit(0 if success else 1)
    except Exception as e:
        log(f"ERRO FATAL: {e}")
        sys.exit(1)
