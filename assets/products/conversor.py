import os
from PIL import Image

# Caminhos das pastas
pasta_origem = "./drinks/"  # Substitua pelo caminho da pasta de imagens .jfif
pasta_destino = "./drinks_jpg"  # Substitua pelo caminho da pasta para salvar as imagens .jpg

# Cria a pasta de destino, caso não exista
if not os.path.exists(pasta_destino):
    os.makedirs(pasta_destino)

# Itera sobre os arquivos na pasta de origem
for arquivo in os.listdir(pasta_origem):
    if arquivo.lower().endswith(".jfif"):  # Verifica se o arquivo é .jfif
        caminho_origem = os.path.join(pasta_origem, arquivo)
        nome_arquivo, _ = os.path.splitext(arquivo)  # Nome do arquivo sem extensão
        caminho_destino = os.path.join(pasta_destino, f"{nome_arquivo}.jpg")

        try:
            # Abre e converte a imagem
            with Image.open(caminho_origem) as img:
                img.convert("RGB").save(caminho_destino, "JPEG")
                print(f"Convertido: {arquivo} -> {nome_arquivo}.jpg")
        except Exception as e:
            print(f"Erro ao converter {arquivo}: {e}")

print("Conversão concluída!")
