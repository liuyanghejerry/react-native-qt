class Component {
  children = [];

  // Add children
  appendChild(child) {
    console.log('Component.appendChild()', child);
    this.children.push(child);
  }

  // Remove children
  removeChild(child) {
    const index = this.children.indexOf(child);
    this.children.splice(index, 1);
  }

  appendToParent(parent) {
    parent.appendChild(this);
  }

  update(oldProps, newProps) {
    console.log('Component props update');
    // for (let prop in newProps) {
    //   if (oldProps[prop] !== newProps[prop]) {
    //     this.element[prop] = newProps[prop];
    //   }
    // }
  }

  renderChildren(parent) {
    for (let i = 0; i < this.children.length; i++) {
      const element = this.children[i];
      element.render(parent);
    }
  }

}

module.exports = Component;
