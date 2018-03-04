module.exports = [
  {
    widgetName: 'Widget',
    widgetQtName: 'QWidget',
    methods: [
      {
        name: 'show',
        type: 'getter',
        ret: 'null',
      },
      {
        name: 'windowTitle',
        type: 'getter',
        ret: 'string',
      },
      {
        name: 'setWindowTitle',
        type: 'setter',
        args: ['string'],
      },
    ],
  },
  {
    widgetName: 'Button',
    widgetQtName: 'QPushButton',
    methods: [
      {
        name: 'show',
        type: 'getter',
        ret: 'null',
      },
      {
        name: 'text',
        type: 'getter',
        ret: 'string',
      },
      {
        name: 'setText',
        type: 'setter',
        args: ['string'],
      },
      {
        name: 'clicked',
        type: 'setter',
        args: ['callback'],
      },
    ],
  },
  {
    widgetName: 'Label',
    widgetQtName: 'QLabel',
    methods: [
      {
        name: 'show',
        type: 'getter',
        ret: 'null',
      },
      {
        name: 'text',
        type: 'getter',
        ret: 'string',
      },
      {
        name: 'setText',
        type: 'setter',
        args: ['string'],
      },
    ],
  },
  {
    widgetName: 'Input',
    widgetQtName: 'QLineEdit',
    methods: [
      {
        name: 'show',
        type: 'getter',
        ret: 'null',
      },
      {
        name: 'text',
        type: 'getter',
        ret: 'string',
      },
      {
        name: 'setText',
        type: 'setter',
        args: ['string'],
      },
      {
        name: 'returnPressed',
        type: 'setter',
        args: ['callback'],
      },
    ],
  },
]
