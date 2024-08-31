export function getAssetFromSymbolBingxOkx(symbol: string) {
    const [asset] = symbol.split('-');
    return asset;
}
