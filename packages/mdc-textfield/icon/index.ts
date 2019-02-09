/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCComponent} from '@material/base/component';
import {EventType, SpecificEventListener} from '@material/base/index';
import {MDCTextFieldIconFoundation} from './foundation';

class MDCTextFieldIcon extends MDCComponent<MDCTextFieldIconFoundation> {
  static attachTo(root: Element): MDCTextFieldIcon {
    return new MDCTextFieldIcon(root);
  }

  get foundation(): MDCTextFieldIconFoundation {
    return this.foundation_;
  }

  getDefaultFoundation(): MDCTextFieldIconFoundation {
    // tslint:disable:object-literal-sort-keys
    return new MDCTextFieldIconFoundation({
      getAttr: (attr) => this.root_.getAttribute(attr),
      setAttr: (attr, value) => this.root_.setAttribute(attr, value),
      removeAttr: (attr) => this.root_.removeAttribute(attr),
      setContent: (content) => this.root_.textContent = content,
      registerInteractionHandler: <E extends EventType>(evtType: E, handler: SpecificEventListener<E>) => {
        this.root_.addEventListener(evtType, handler);
      },
      deregisterInteractionHandler: <E extends EventType>(evtType: E, handler: SpecificEventListener<E>) => {
        this.root_.removeEventListener(evtType, handler);
      },
      notifyIconAction: () => this.emit(
        MDCTextFieldIconFoundation.strings.ICON_EVENT, {} /* evtData */, true /* shouldBubble */),
    });
    // tslint:enable:object-literal-sort-keys
  }
}

export {MDCTextFieldIcon as default, MDCTextFieldIcon};
export * from './adapter';
export * from './foundation';
