import {Component, ElementRef, Input, NgZone, ViewChild} from '@angular/core';
import {BehaviorSubject, fromEvent, Subject, Subscription} from "rxjs";
import {takeUntil, tap} from "rxjs/operators";

@Component({
  selector: 'app-image-rotator',
  templateUrl: './image-rotator.component.html',
  styleUrls: ['./image-rotator.component.css']
})
export class ImageRotatorComponent {
  @ViewChild('boxWrapper', { static: true })
  boxWrapperElRef!: ElementRef<HTMLDivElement>;

  @ViewChild('box', { static: true }) boxElRef!: ElementRef<HTMLDivElement>;

  @ViewChild('rotate', { static: true })
  rotateElRef!: ElementRef<HTMLDivElement>;

  @Input() id!: string | number;

  @Input() minWidth: number = 500;
  @Input() minHeight: number = 500;
  @Input() width: number = 500;
  @Input() height: number = 500;

  @Input() initialTop: number = 50;
  @Input() initialLeft: number = 50;

  @Input() set disabled(disabled: boolean) {
    this.active$.next(!disabled);
  }

  private resizingSubs: Subscription[] = [];
  private draggingSub?: Subscription;

  imageUrl: string = 'assets/logo-leaf.png';

  active$ = new BehaviorSubject<boolean>(true);

  initX :any;
  initY:any;
  mousePressX:any;
  mousePressY:any;
  initW:any;
  initH:any;
  initRotate:any;
  moveType:any;

  get boxWrapper(): HTMLDivElement {
    return this.boxWrapperElRef.nativeElement;
  }

  get box(): HTMLDivElement {
    return this.boxElRef.nativeElement;
  }

  get rotateBtn(): HTMLDivElement {
    return this.rotateElRef.nativeElement;
  }

  private destroy$ = new Subject<void>();

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {

    this.active$.pipe(takeUntil(this.destroy$)).subscribe((active) => {
      if (active) {
        this.enableResizing();
        this.enableDragging();
      } else {
        this.disableResizing();
        this.disableDrag();
      }
    });

    // this.handleResizing();
    this.handleRotating();

    this.resize(-1000000,-1000000);
    this.repositionElement(this.initialTop, this.initialLeft);
  }

  private repositionElement(x: number, y: number): void {
    let tempTop=this.boxWrapper.style.top;
    let tempTop2=0;
    if(this.moveType =='mousedown'){
      tempTop2=y;
    }else if(this.moveType =='mouseup'){
      tempTop2=y*(-1);
    }
    tempTop=tempTop+tempTop2

    this.boxWrapper.style.left = x + 'px';
    this.boxWrapper.style.top = tempTop + 'px';
    console.log("this.boxWrapper ", this.boxWrapper.style.top);
    console.log("movetype ", this.moveType);
  }

  private resize(width: number, height: number): void {
    if(width == -1000000){
      this.box.style.width = '100px';
    }else{
      this.box.style.width = width + 'px';
    }
    if(height == -1000000){
      this.box.style.height = '100px';
    }else{
      this.box.style.height = height + 'px';
    }

  }

  private rotateBox(deg: number): void {
    this.boxWrapper.style.transform = `rotate(${deg}deg)`;
  }

  private getCurrentRotation(el:any): number {
    var st = window.getComputedStyle(el, null);
    var tm =
      st.getPropertyValue('-webkit-transform') ||
      st.getPropertyValue('-moz-transform') ||
      st.getPropertyValue('-ms-transform') ||
      st.getPropertyValue('-o-transform') ||
      st.getPropertyValue('transform');
    ('none');
    if (tm != 'none') {
      var values = tm.split('(')[1].split(')')[0].split(',');
      var angle = Math.round(
        // @ts-ignore
        Math.atan2(values[1], values[0]) * (180 / Math.PI)
      );
      return angle < 0 ? angle + 360 : angle;
    }
    return 0;
  }

  enableResizing(): void {
    const leftTopMouseDown$ = fromEvent(
      this.getElById('left-top')!,
      'mousedown'
    ).pipe(tap((e) => this.resizeHandler(e, true, true, true, true)));

    const rightTopMouseDown$ = fromEvent(
      this.getElById('right-top')!,
      'mousedown'
    ).pipe(tap((e) => this.resizeHandler(e, false, true, true, true)));

    const rightBottomMouseDown$ = fromEvent(
      this.getElById('right-bottom')!,
      'mousedown'
    ).pipe(tap((e) => this.resizeHandler(e, false, false, true, true)));

    const leftBottomMouseDown$ = fromEvent(
      this.getElById('left-bottom')!,
      'mousedown'
    ).pipe(tap((e) => this.resizeHandler(e, true, false, true, true)));

    this.ngZone.runOutsideAngular(() => {
      this.resizingSubs.push(
        leftTopMouseDown$.subscribe(),
        rightTopMouseDown$.subscribe(),
        rightBottomMouseDown$.subscribe(),
        leftBottomMouseDown$.subscribe()
      );
    });
  }

  disableResizing(): void {
    this.resizingSubs.forEach((sub) => sub.unsubscribe());
  }

  enableDragging(): void {

    const boxWrapperMouseDown$ = fromEvent<MouseEvent>(
      this.boxWrapper,
      'mousedown',
      { capture: true }
    ).pipe(
      tap((event: any) => {
        this.moveType=event?.type;
        // @ts-ignore
        if (
          event.target.className.indexOf('dot') > -1 ||
          event.target.className != 'box'
        ) {
          event.preventDefault();
          return;
        }

        this.initX = this.boxWrapper.offsetLeft;
        this.initY = this.boxWrapper.offsetTop;
        this.mousePressX = event.clientX;
        this.mousePressY = event.clientY;

        const eventMoveHandler = (event : any) => {
          this.repositionElement(
            this.initX + (event.clientX - this.mousePressX),
            this.initY + (event.clientY - this.mousePressY)
          );
        };

        const eventEndHandler = () => {
          this.boxWrapper.removeEventListener(
            'mousemove',
            eventMoveHandler,
            false
          );
          this.moveType=event?.type;
          window.removeEventListener('mouseup', eventEndHandler);
        };

        this.boxWrapper.addEventListener('mousemove', eventMoveHandler, false);
        this.moveType=event?.type;

        window.addEventListener('mouseup', eventEndHandler, false);
        this.moveType=event?.type;
      })
    );

    this.ngZone.runOutsideAngular(() => {
      this.draggingSub = boxWrapperMouseDown$.subscribe();
    });
  }

  disableDrag(): void {
    this.draggingSub?.unsubscribe();
  }

  handleRotating(): void {
    this.ngZone.runOutsideAngular(() => {
      this.rotateBtn!.addEventListener(
        'mousedown',
        (event) => {
          // if (event.target.className.indexOf("dot") > -1) {
          //     return;
          // }

          this.initX = this.boxWrapper.offsetLeft;
          this.initY = this.boxWrapper.offsetTop;
          this.mousePressX = event.clientX;
          this.mousePressY = event.clientY;

          let arrow = document.querySelector('#box');
          let arrowRects = arrow!.getBoundingClientRect();
          let arrowX = arrowRects.left + arrowRects.width / 2;
          let arrowY = arrowRects.top + arrowRects.height / 2;

          const eventMoveHandler = (event : any) => {
            let angle =
              Math.atan2(event.clientY - arrowY, event.clientX - arrowX) -
              Math.PI / 2;
            this.rotateBox((angle * 180) / Math.PI);
          };

          const eventEndHandler = () => {
            window.removeEventListener('mousemove', eventMoveHandler, false);
            window.removeEventListener('mouseup', eventEndHandler);
          };

          window.addEventListener('mousemove', eventMoveHandler, false);
          window.addEventListener('mouseup', eventEndHandler, false);
        },
        false
      );
    });
  }

  private resizeHandler(
    event : any,
    left = false,
    top = false,
    xResize = false,
    yResize = false
  ) {
    this.initX = this.boxWrapper.offsetLeft;
    this.initY = this.boxWrapper.offsetTop;
    this.mousePressX = event.clientX;
    this.mousePressY = event.clientY;

    this.initW = this.box.offsetWidth;
    this.initH = this.box.offsetHeight;

    this.initRotate = this.getCurrentRotation(this.boxWrapper);
    let initRadians = (this.initRotate * Math.PI) / 180;
    console.log(initRadians);
    let cosFraction = Math.cos(initRadians);
    let sinFraction = Math.sin(initRadians);

    const eventMoveHandler = (event : any) => {
      // debugger;
      let wDiff = event.clientX - this.mousePressX;
      let hDiff = event.clientY - this.mousePressY;
      let rotatedWDiff = cosFraction * wDiff + sinFraction * hDiff;
      let rotatedHDiff = cosFraction * hDiff - sinFraction * wDiff;

      let newW = this.initW,
        newH = this.initH,
        newX = this.initX,
        newY = this.initY;

      const cx = this.initX + this.initW / 2;
      const cy = this.initY + this.initH / 2;
      const bottomRightX = this.mousePressX;
      const bottomRightY = this.mousePressY;
      const rotatedA = this.rotate(
        this.initX,
        this.initY,
        cx,
        cy,
        -this.initRotate
      );
      const newCenter = [
        (rotatedA[0] + bottomRightX) / 2,
        (rotatedA[1] + bottomRightY) / 2,
      ];
      const newTopLeft = this.rotate(
        rotatedA[0],
        rotatedA[1],
        newCenter[0],
        newCenter[1],
        -this.initRotate
      );
      const newBottomRight = this.rotate(
        bottomRightX,
        bottomRightY,
        newCenter[0],
        newCenter[1],
        -this.initRotate
      );

      if (xResize) {
        if (left) {
          newW = this.initW - rotatedWDiff;
        } else {
          newW = this.initW + rotatedWDiff;
        }
        if (newW < this.minWidth) {
          newW = this.minWidth;
        }
      }

      if (yResize) {
        if (top) {
          newH = this.initH - rotatedHDiff;
        } else {
          newH = this.initH + rotatedHDiff;
        }
        if (newH < this.minHeight) {
          newH = this.minHeight;
        }
      }

      // constrain aspect ratio, if a corner is being dragged
      let scale;
      if (xResize && yResize) {
        scale = Math.max(newW / this.initW, newH / this.initH);
        newW = scale * this.initW;
        newH = scale * this.initH;
      }

      // recalculate position
      if (xResize) {
        if (left) {
          rotatedWDiff = this.initW - newW;
        } else {
          rotatedWDiff = newW - this.initW;
        }
        newX += 0.5 * rotatedWDiff * cosFraction;
        newY += 0.5 * rotatedWDiff * sinFraction;
      }

      if (yResize) {
        if (top) {
          rotatedHDiff = this.initH - newH;
        } else {
          rotatedHDiff = newH - this.initH;
        }
        newX -= 0.5 * rotatedHDiff * sinFraction;
        newY += 0.5 * rotatedHDiff * cosFraction;
      }

    };

    const adjustHandler = (event : any) => {
      console.log(event, this.initX, this.initY, this.initH, this.initW);
      const cx = this.initX + this.initW / 2;
      const cy = this.initY + this.initH / 2;
      const bottomRightX = event.clientX;
      const bottomRightY = event.clientY;
      const rotatedA = this.rotate(
        this.initX,
        this.initY,
        cx,
        cy,
        -this.initRotate
      );
      const newCenter = [
        (rotatedA[0] + bottomRightX) / 2,
        (rotatedA[1] + bottomRightY) / 2,
      ];

      const newTopLeft = this.rotate(
        rotatedA[0],
        rotatedA[1],
        newCenter[0],
        newCenter[1],
        this.initRotate
      );
      const newBottomRight = this.rotate(
        bottomRightX,
        bottomRightY,
        newCenter[0],
        newCenter[1],
        this.initRotate
      );

      this.resize(
        newBottomRight[0] - newTopLeft[0],
        newBottomRight[1] - newTopLeft[1]
      );
      this.repositionElement(newTopLeft[0], newTopLeft[1]);
    };

    window.addEventListener('mousemove', adjustHandler, false);
    window.addEventListener(
      'mouseup',
      function eventEndHandler() {
        window.removeEventListener('mousemove', adjustHandler, false);
        window.removeEventListener('mouseup', adjustHandler);
      },
      false
    );
  }

  private rotate(x : number, y : number, cx : number, cy : number, angle : number) {
    return [
      (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
      (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
    ];
  }

  private getElById(elId: string): HTMLElement | null {
    return this.boxWrapper.querySelector(`#${elId}`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.unsubscribe();
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
