import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export class JsonParserInterceptor implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return httpRequest.responseType === "json"
      ? this.handleJsonResponses(httpRequest, next)
      : next.handle(httpRequest);
  }

  private handleJsonResponses(
    httpRequest: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next
      .handle(httpRequest.clone({ responseType: "text" }))
      .pipe(map(event => this.parseResponse(event)));
  }

  private parseResponse(event: HttpEvent<any>): HttpEvent<any> {
    if (event instanceof HttpResponse) {
      return event.clone({
        body: event.body === '' ? undefined : JSON.parse(event.body, (key, value) => {
          switch (key) {
            case "releaseDate":
            case "modificationTime":
            case "creationTime":
            case "dateScanned":
              return new Date(value);
            default:
              return value;
          }
        })
      });
    } else {
      return event;
    }
  }

}
