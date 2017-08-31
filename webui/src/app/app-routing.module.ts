import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ChannelBrowserComponent} from "./channelbrowser/channel-browser.component";
import {SettingsComponent} from "./settings/settings.component";

const routes: Routes = [
  {
    path: '',
    children: []
  },
  {
    path: 'channel/:id',
    component: ChannelBrowserComponent
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
