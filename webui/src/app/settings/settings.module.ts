import {NgModule} from "@angular/core";
import {SettingsComponent} from "./settings.component";
import {MediaSettingsComponent} from "./media-settings.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {AsyncPipe} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";
import {LibraryCategorySettingsComponent} from "./library-category-settings.component";

@NgModule({
  declarations: [
    SettingsComponent,
    MediaSettingsComponent,
    LibraryCategorySettingsComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    FormsModule
  ]
})
export class SettingsModule {}
