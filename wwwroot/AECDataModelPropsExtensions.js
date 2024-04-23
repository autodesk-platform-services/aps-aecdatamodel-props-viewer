//
// Copyright (c) Autodesk, Inc. All rights reserved
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//

import { AECDataModelPropsPanelPanel } from './AECDataModelPropsPanelPanel.js';

class AECDataModelPropsExtension extends Autodesk.Viewing.Extension{
  constructor(viewer, options) {
    super(viewer, options);
    this._button = null;
    this._panel = null;
  }

  onToolbarCreated(toolbar) {
    this._panel = new AECDataModelPropsPanelPanel(this, 'aecdm-props-panel', 'AEC DM Properties');
    this._button = this.createToolbarButton('aecdm-props--button', 'https://img.icons8.com/ios/30/camera--v3.png', 'AEC DM Properties');
    this._button.onClick = async () => {
      this._panel.setVisible(!this._panel.isVisible());
      this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
      if (this._panel.isVisible()) {
        this.update();
      }
    };
  }

  onModelLoaded(model) {
    super.onModelLoaded(model);
    this.update();
  }

  onSelectionChanged(model, dbids) {
    super.onSelectionChanged(model, dbids);
    this.update();
  }

  onIsolationChanged(model, dbids) {
    super.onIsolationChanged(model, dbids);
    this.update();
  }

  createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    let group = this.viewer.toolbar.getControl('properties-toolbar-group');
    if (!group) {
      group = new Autodesk.Viewing.UI.ControlGroup('properties-toolbar-group');
      this.viewer.toolbar.addControl(group);
    }
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    group.addControl(button);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
      icon.style.backgroundImage = `url(${buttonIconUrl})`;
      icon.style.backgroundSize = `24px`;
      icon.style.backgroundRepeat = `no-repeat`;
      icon.style.backgroundPosition = `center`;
    }
    return button;
  }

  async update() {
    if (this._panel) {
      const selectedIds = this.viewer.getSelection();
      const isolatedIds = this.viewer.getIsolatedNodes();
      if (selectedIds.length > 0) { // If any nodes are selected, compute the aggregates for them
        this._panel.update(this.viewer.model, selectedIds, SUMMARY_PROPS);
      } else if (isolatedIds.length > 0) { // Or, if any nodes are isolated, compute the aggregates for those
        this._panel.update(this.viewer.model, isolatedIds, SUMMARY_PROPS);
      } else { // Otherwise compute the aggregates for all nodes
        const dbids = await this.findLeafNodes(this.viewer.model);
        this._panel.update(this.viewer.model, dbids, SUMMARY_PROPS);
      }
    }
  }

  removeToolbarButton(button) {
    const group = this.viewer.toolbar.getControl('properties-toolbar-group');
    group.removeControl(button);
  }

  async load() {
    console.log('AEC DM Properties Extension has been loaded.');
    this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated);
    return true;
  }

  unload() {
    if (this._button) {
      this.removeToolbarButton(this._button);
      this._button = null;
    }
    if (this._panel) {
      this._panel.setVisible(false);
      this._panel.uninitialize();
      this._panel = null;
    }
    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('AECDataModelPropsExtension', AECDataModelPropsExtension);