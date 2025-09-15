import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtml'
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string | null | undefined, allow: string[] = []): string {
    if (!value) return '';
    const whitelist = new Set(allow.map(t => t.toUpperCase()));
    const doc = new DOMParser().parseFromString(value, 'text/html');
    Array.from(doc.body.getElementsByTagName("*"))
      .reverse()
      .filter((el) => !whitelist.has(el.nodeName))
      .forEach((el) => el.replaceWith(...Array.from(el.childNodes)));
    return doc.body.innerHTML || '';
  }
}
