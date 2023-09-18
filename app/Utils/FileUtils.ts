import AdmZip from 'adm-zip';

export class FileUtils {
    static zipFolder(path: string, outputFileName: string) {
        try {
            const zip = new AdmZip();
            zip.addLocalFolder(path);
            zip.writeZip(outputFileName);
        } catch (e) {
            return e;
        }

        return null;
    }
}
