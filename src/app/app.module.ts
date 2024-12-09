/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageCanvasComponent } from './logo-set/image-canvas/image-canvas.component';
import { ImageResizerComponent } from './logo-set/image-resizer/image-resizer.component';
import {ResizableModule} from "angular-resizable-element";

// @ts-ignore
@NgModule({
  declarations: [
    AppComponent,
    ImageCanvasComponent,
    ImageResizerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ResizableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
