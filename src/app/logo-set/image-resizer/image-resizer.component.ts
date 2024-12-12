import { Component,NgModule, OnInit } from '@angular/core';
import {ResizableModule, ResizeEvent} from 'angular-resizable-element';

// @ts-ignore
@Component({
  selector: 'app-image-resizer',
  templateUrl: './image-resizer.component.html',
  styleUrls: ['./image-resizer.component.css']
})

export class ImageResizerComponent implements OnInit {
  imageUrl: string = 'assets/logo-leaf.png';

  constructor() { }

  dynamicStyles = {
    'background-image': "url('assets/logo-leaf.png')",
    'background-repeat': 'no-repeat',
    'background-size': 'contain',
    'background-position': 'center',
    'width': '100px',
    'height': '100px',
    'border-color': 'red',
    'position': 'fixed',
    'border': '5px solid gray'
  };

  dynamicImgStyles ={
    'width': '100%',
    'height': '100%',
    'object-fit': 'cover'
  }


  ngOnInit(): void {
  }
  onResizeEnd(event: ResizeEvent): void {
    console.log(event)
    let tempHight=this.dynamicStyles?.height;
    let tempWidth=this.dynamicStyles?.width;
    if(event?.edges?.bottom || event?.edges?.top){
      this.dynamicStyles.height=(Number(tempHight.replace("px",'')) + Number(event.edges.bottom))+'px';
    }else if(event?.edges?.top){
      this.dynamicStyles.height=(Number(tempHight.replace("px",'')) + Number(event.edges.top))+'px';
    }else if(event?.edges?.left){
      this.dynamicStyles.width=(Number(tempWidth.replace("px",'')) + Number(event.edges.left))+'px';
    }else if(event?.edges?.right){
      this.dynamicStyles.width=(Number(tempWidth.replace("px",'')) + Number(event.edges.right))+'px';
    }
  }
/* Rotator function start */
  active1 = true;
  active2 = true;

  toggle1(): void {
    this.active1 = !this.active1;
  }

  toggle2(): void {
    this.active2 = !this.active2;
  }
  /* Rotator function End */
}

