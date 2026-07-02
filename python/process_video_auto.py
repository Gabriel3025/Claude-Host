#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script Automático: Vídeo → Áudio → Transcrição
Para Canal Dark - Análise de Narração
"""

import os
import sys
import subprocess
from pathlib import Path

# Fix encoding no Windows
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def process_video(video_path):
    """Processa vídeo: extrai áudio e transcreve com Whisper"""

    video_path = Path(video_path).resolve()

    # Validações
    if not video_path.exists():
        print(f"❌ Erro: Arquivo não encontrado: {video_path}")
        return False

    # Criar diretório de saída
    output_dir = video_path.parent / f"{video_path.stem}_processed"
    output_dir.mkdir(exist_ok=True)

    audio_file = output_dir / "audio.wav"
    transcript_file = output_dir / "transcription.vtt"
    json_file = output_dir / "transcription.json"

    print("🎬 Processamento Automático de Vídeo para Canal Dark")
    print("=" * 60)
    print(f"📁 Vídeo: {video_path.name}")
    print(f"📂 Saída: {output_dir}")
    print()

    # Passo 1: Extrair áudio
    print("⏳ 1️⃣  Extraindo áudio do vídeo...")
    try:
        cmd_ffmpeg = [
            "ffmpeg",
            "-i", str(video_path),
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            str(audio_file),
            "-loglevel", "quiet"
        ]
        subprocess.run(cmd_ffmpeg, check=True)
        print(f"   ✅ Áudio extraído: {audio_file.name}")
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Erro ao extrair áudio: {e}")
        return False

    print()

    # Passo 2: Transcrever com Whisper
    print("⏳ 2️⃣  Transcrevendo com Whisper...")
    print("   (Primeira execução baixa modelo ~1.4GB, depois é rápido)")
    try:
        cmd_whisper = [
            "whisper",
            str(audio_file),
            "--output_format", "all",
            "--output_dir", str(output_dir),
            "--language", "pt",
            "--model", "base"
        ]
        subprocess.run(cmd_whisper, check=True)
        print(f"   ✅ Transcrição concluída!")
        print(f"   📄 VTT: {transcript_file.name}")
        print(f"   📊 JSON: {json_file.name}")
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Erro ao transcrever: {e}")
        return False

    print()
    print("=" * 60)
    print("✅ PROCESSAMENTO CONCLUÍDO!")
    print()
    print("📂 Arquivos gerados:")
    print(f"   • {audio_file}")
    print(f"   • {transcript_file}")
    print(f"   • {json_file}")
    print()
    print("📋 Próximo passo: Copie o conteúdo da transcrição e envie para Claude")
    print()

    # Tentar abrir o diretório
    try:
        if sys.platform == "win32":
            os.startfile(str(output_dir))
        elif sys.platform == "darwin":
            subprocess.run(["open", str(output_dir)])
        else:
            subprocess.run(["xdg-open", str(output_dir)])
    except:
        pass

    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Erro: Forneça o caminho do vídeo")
        print()
        print("Uso:")
        print('  python process_video_auto.py "C:\\caminho\\para\\video.mp4"')
        print()
        print("Exemplos:")
        print('  python process_video_auto.py "C:\\Desktop\\Canal Dark\\3º Video.mp4"')
        sys.exit(1)

    video_file = sys.argv[1]
    success = process_video(video_file)
    sys.exit(0 if success else 1)
