import { FileLoader } from './FileLoader';
import Parameter from '../Parameter';
const proxyURL = 'https://www.geowe.org/proxy/proxy.php?url=';
export class UrlFileLoader extends FileLoader {
    constructor(mapSetting) {
        super(mapSetting);
        this._files = [];
        this._layerSetting = mapSetting.getLayerSetting();

        if (Object.prototype.hasOwnProperty.call(this._layerSetting, Parameter.GEOJSON_FILE_URL)) {
            this._files = this._layerSetting.geojson.files;
            this._totalFiles = this._files.length;
            const colorPaletteSetting = this._mapSetting.colorPalette;
            colorPaletteSetting.colorTotal = this._totalFiles;
            this.configureColorPalette(colorPaletteSetting);
        }
    }

    load() {
        super.load();

        this._files.forEach((file) => {
            this.loadUrlFile(file);
        });
    }

    loadUrlFile(url, proxy = false) {
        this._loadMonitorPanel.show('Cargando url...');
        const request = proxy ? proxyURL + url : url;

        fetch(request)
            .then((response) => {
                this._loadMonitorPanel.show('Cargando datos...');
                return response.json();
            })
            .then((json) => {
                this._loadMonitorPanel.show('Obteniendo elementos...');
                setTimeout(() => {
                    var layerName = url.split('/').pop().split('?')[0];
                    var fc = this.getFeatureCollection(json);
                    this._loadMonitorPanel.show(`Cargando ${fc.length} elementos...`);
                    this.addToMap(fc, layerName);
                    if (json.title) {
                        this.setMapTitle(json.title);
                    }
                }, 900);
            })
            .catch((error) => {
                // this._totalFileLoaded++;
                this.loadUrlFile(url, true);
                // alert('Problema al cargar: ' + error.message);
            });
    }
}