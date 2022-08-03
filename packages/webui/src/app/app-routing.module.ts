import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {DetailsComponent} from "./channelbrowser/details.component";
import {StartPageComponent} from "./startpage/start-page.component";

const routes: Routes = [
  {
    path: '',
    component: StartPageComponent
  },
  {
    path: 'channel/:id',
    component: DetailsComponent
  },
  {
    path: 'channel/:id/:itemId',
    component: DetailsComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
