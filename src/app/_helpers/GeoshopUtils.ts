import { IOrder, IOrderItem } from '../_models/IOrder';
import { IProduct } from '../_models/IProduct';

export class GeoshopUtils {

  /**
   * Try to get the id from an url
   * The id is located in the end
   */
  public static ExtractIdFromUrl(url?: string): number {
    let id = -1;

    try {
      if (url) {
        if (url.endsWith('/')) {
          url = url.substr(0, url.length - 1);
        }
        const temp = url.split('/');
        id = parseInt(temp[temp.length - 1], 10);
      }
    } catch {
      id = -1;
    }
    return id;
  }

  public static deepCopyOrder(order: IOrder): IOrder {
    return JSON.parse(JSON.stringify(order)) as IOrder;
  }

  public static downloadData(url: string, filename: string) {
    try {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = filename;
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
    }
  }
}
