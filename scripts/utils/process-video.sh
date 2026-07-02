#!/bin/bash

# Script de Processamento de Vídeo para Canal Dark
# Extrai áudio + transcreve automaticamente

VIDEO_FILE="$1"
OUTPUT_DIR="${VIDEO_FILE%.*}_processed"

# Validações
if [ -z "$VIDEO_FILE" ]; then
    echo "❌ Erro: Forneça o caminho do vídeo"
    echo "Uso: ./process-video.sh '/caminho/para/video.mp4'"
    exit 1
fi

if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Erro: Arquivo não encontrado: $VIDEO_FILE"
    exit 1
fi

# Criar diretório de saída
mkdir -p "$OUTPUT_DIR"

AUDIO_FILE="$OUTPUT_DIR/audio.wav"
TRANSCRIPT_FILE="$OUTPUT_DIR/transcription.vtt"

echo "🎬 Processando vídeo: $VIDEO_FILE"
echo ""

# Passo 1: Extrair áudio
echo "1️⃣  Extraindo áudio..."
ffmpeg -i "$VIDEO_FILE" -vn -acodec pcm_s16le -ar 16000 "$AUDIO_FILE" -loglevel quiet
if [ $? -eq 0 ]; then
    echo "✅ Áudio extraído: $AUDIO_FILE"
else
    echo "❌ Erro ao extrair áudio"
    exit 1
fi

echo ""

# Passo 2: Transcrever com Whisper
echo "2️⃣  Transcrevendo com Whisper (pode levar alguns minutos)..."
whisper "$AUDIO_FILE" --output_format vtt --output_dir "$OUTPUT_DIR" --language pt --model base
if [ $? -eq 0 ]; then
    echo "✅ Transcrição concluída: $TRANSCRIPT_FILE"
else
    echo "❌ Erro ao transcrever"
    exit 1
fi

echo ""
echo "✅ Processamento completo!"
echo ""
echo "Arquivos gerados:"
echo "  - Áudio: $AUDIO_FILE"
echo "  - Transcrição: $TRANSCRIPT_FILE"
echo ""
echo "📁 Diretório: $OUTPUT_DIR"
