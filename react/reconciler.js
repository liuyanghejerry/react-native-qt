const now = require("performance-now");
const { createElement } = require('./elements');

const Reconciler = require('react-reconciler');

const emptyObject = {};

function attachParentInQt(parent, child) {
  console.log('attachParentInQt');
  if (child.widget && parent.widget) {
    child.widget.setParent(parent.widget);
  }
}

function detachParentInQt(child) {
  console.log('detachParentInQt');
  if (child.widget) {
    child.widget.clearParent();
  }
}

const DesktopRenderer = Reconciler({
  appendInitialChild(parentInstance, child) {
    if (parentInstance.appendChild) {
      parentInstance.appendChild(child);
      attachParentInQt(parentInstance, child);
    } else {
      parentInstance.document = child;
    }
  },

  createInstance(type, props, internalInstanceHandle) {
    return createElement(type, props, internalInstanceHandle);
  },

  createTextInstance(text, rootContainerInstance, internalInstanceHandle) {
    return text;
  },

  finalizeInitialChildren(wordElement, type, props) {
    return false;
  },

  getPublicInstance(inst) {
    return inst;
  },

  prepareForCommit() {
    // noop
  },

  prepareUpdate(wordElement, type, oldProps, newProps) {
    return true;
  },

  resetAfterCommit() {
    // noop
  },

  resetTextContent(wordElement) {
    // noop
  },

  getRootHostContext(rootInstance) {
    // You can use this 'rootInstance' to pass data from the roots.
    // console.log(rootInstance, ROOT_NODE);
    // return ROOT_NODE;
    return emptyObject;
  },

  getChildHostContext() {
    return emptyObject;
  },

  shouldSetTextContent(type, props) {
    return false;
  },

  now: () => now(),

  scheduleAnimationCallback() {
    // noop
  },

  scheduleDeferredCallback(work, { timeout }) {
    return setTimeout(work, timeout);
  },

  useSyncScheduling: true,

  shouldDeprioritizeSubtree() {
    return false;
  },

  mutation: {
    appendChild(parentInstance, child) {
      if (parentInstance.appendChild) {
        parentInstance.appendChild(child);
        attachParentInQt(parentInstance, child);
      } else {
        parentInstance.document = child;
      }
    },

    appendChildToContainer(parentInstance, child) {
      if (parentInstance === child) {
        return;
      }
      if (parentInstance.appendChild) {
        parentInstance.appendChild(child);
        attachParentInQt(parentInstance, child);
      } else {
        parentInstance.document = child;
      }
    },

    removeChild(parentInstance, child) {
      parentInstance.removeChild(child);
      detachParentInQt(child);
    },

    removeChildFromContainer(parentInstance, child) {
      parentInstance.removeChild(child);
      detachParentInQt(child);
    },

    insertBefore(parentInstance, child, beforeChild) {
      // noob
    },

    commitUpdate(instance, updatePayload, type, oldProps, newProps) {
      if (typeof instance.update !== 'undefined') {
        instance.update(oldProps, newProps);
      }
    },

    commitMount(instance, updatePayload, type, oldProps, newProps) {
      // noop
    },

    commitTextUpdate(textInstance, oldText, newText) {
      textInstance.children = newText;
    },
  }
});

module.exports = DesktopRenderer;
