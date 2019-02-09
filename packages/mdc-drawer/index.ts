/**
 * @license
 * Copyright 2016 Google Inc.
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
import {SpecificEventListener} from '@material/base/index';
import {MDCListFoundation} from '@material/list/foundation';
import {MDCList} from '@material/list/index';
import * as createFocusTrap from 'focus-trap';
import {MDCDrawerAdapter} from './adapter';
import {strings} from './constants';
import {MDCDismissibleDrawerFoundation} from './dismissible/foundation';
import {MDCModalDrawerFoundation} from './modal/foundation';
import {FocusTrapFactory, ListFactory} from './types';
import * as util from './util';

class MDCDrawer extends MDCComponent<MDCDismissibleDrawerFoundation> {
  static attachTo(root: Element): MDCDrawer {
    return new MDCDrawer(root);
  }

  /**
   * Returns true if drawer is in the open position.
   */
  get open(): boolean {
    return this.foundation_.isOpen();
  }

  /**
   * Toggles the drawer open and closed.
   */
  set open(isOpen: boolean) {
    if (isOpen) {
      this.foundation_.open();
    } else {
      this.foundation_.close();
    }
  }

  private previousFocus_?: Element | null;
  private scrim_!: Element | null; // assigned in initialSyncWithDOM()
  private list_?: MDCList; // assigned in initialize()

  private focusTrap_?: createFocusTrap.FocusTrap; // assigned in initialSyncWithDOM()
  private focusTrapFactory_!: FocusTrapFactory; // assigned in initialize()

  private handleScrimClick_?: SpecificEventListener<'click'>; // initialized in initialSyncWithDOM()
  private handleKeydown_!: SpecificEventListener<'keydown'>; // initialized in initialSyncWithDOM()
  private handleTransitionEnd_!: SpecificEventListener<'transitionend'>; // initialized in initialSyncWithDOM()

  initialize(
      focusTrapFactory: FocusTrapFactory = createFocusTrap as unknown as FocusTrapFactory,
      listFactory: ListFactory = (el) => new MDCList(el)) {
    const listEl = this.root_.querySelector(`.${MDCListFoundation.cssClasses.ROOT}`);
    if (listEl) {
      this.list_ = listFactory(listEl);
      this.list_.wrapFocus = true;
    }
    this.focusTrapFactory_ = focusTrapFactory;
  }

  initialSyncWithDOM() {
    const {MODAL} = MDCDismissibleDrawerFoundation.cssClasses;
    const {SCRIM_SELECTOR} = MDCDismissibleDrawerFoundation.strings;

    this.scrim_ = (this.root_.parentNode as Element).querySelector(SCRIM_SELECTOR);

    if (this.scrim_ && this.root_.classList.contains(MODAL)) {
      this.handleScrimClick_ = () => (this.foundation_ as MDCModalDrawerFoundation).handleScrimClick();
      this.scrim_.addEventListener('click', this.handleScrimClick_ as EventListener);
      this.focusTrap_ = util.createFocusTrapInstance(this.root_ as HTMLElement, this.focusTrapFactory_);
    }

    this.handleKeydown_ = (evt) => this.foundation_.handleKeydown(evt);
    this.handleTransitionEnd_ = (evt) => this.foundation_.handleTransitionEnd(evt);

    this.listen('keydown', this.handleKeydown_);
    this.listen('transitionend', this.handleTransitionEnd_);
  }

  destroy() {
    this.unlisten('keydown', this.handleKeydown_);
    this.unlisten('transitionend', this.handleTransitionEnd_);

    if (this.list_) {
      this.list_.destroy();
    }

    const {MODAL} = MDCDismissibleDrawerFoundation.cssClasses;
    if (this.root_.classList.contains(MODAL)) {
      this.scrim_!.removeEventListener('click', this.handleScrimClick_ as EventListener);
      // Ensure drawer is closed to hide scrim and release focus
      this.open = false;
    }
  }

  getDefaultFoundation(): MDCDismissibleDrawerFoundation {
    // tslint:disable:object-literal-sort-keys
    const adapter: MDCDrawerAdapter = {
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      hasClass: (className) => this.root_.classList.contains(className),
      elementHasClass: (element, className) => element.classList.contains(className),
      saveFocus: () => this.previousFocus_ = document.activeElement,
      restoreFocus: () => {
        const previousFocus = this.previousFocus_ as HTMLOrSVGElement | null;
        if (previousFocus && previousFocus.focus && this.root_.contains(document.activeElement)) {
          previousFocus.focus();
        }
      },
      focusActiveNavigationItem: () => {
        const activeNavItemEl =
            this.root_.querySelector<HTMLElement>(`.${MDCListFoundation.cssClasses.LIST_ITEM_ACTIVATED_CLASS}`);
        if (activeNavItemEl) {
          activeNavItemEl.focus();
        }
      },
      notifyClose: () => this.emit(strings.CLOSE_EVENT, {}, true /* shouldBubble */),
      notifyOpen: () => this.emit(strings.OPEN_EVENT, {}, true /* shouldBubble */),
      trapFocus: () => this.focusTrap_!.activate(),
      releaseFocus: () => this.focusTrap_!.deactivate(),
    };
    // tslint:enable:object-literal-sort-keys

    const {DISMISSIBLE, MODAL} = MDCDismissibleDrawerFoundation.cssClasses;
    if (this.root_.classList.contains(DISMISSIBLE)) {
      return new MDCDismissibleDrawerFoundation(adapter);
    } else if (this.root_.classList.contains(MODAL)) {
      return new MDCModalDrawerFoundation(adapter);
    } else {
      throw new Error(
        `MDCDrawer: Failed to instantiate component. Supported variants are ${DISMISSIBLE} and ${MODAL}.`);
    }
  }
}

export {MDCDrawer as default, MDCDrawer, util};
export * from './dismissible/foundation';
export * from './modal/foundation';
export * from './adapter';
export * from './types';
