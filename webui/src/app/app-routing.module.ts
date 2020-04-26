import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SettingsComponent} from "./settings/settings.component";
import {DetailsComponent} from "./channelbrowser/details.component";

const routes: Routes = [
  {
    path: '',
    children: []
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
