import sys
import json

def save_proxies(proxies):
    with open('proxy_list.txt', 'w') as file:
        for proxy in proxies:
            file.write(proxy + '\n')

if __name__ == "__main__":
    proxies = json.loads(sys.argv[1])
    print("Proxies recebidas:", proxies)  # Adicionado para verificar os dados recebidos
    save_proxies(proxies)
    print(f"Proxies salvas no arquivo proxy_list.txt.")
