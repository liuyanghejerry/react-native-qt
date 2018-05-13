{
  "conditions": [
    [
      "OS=='win'", {
        "targets": [
          {
            "target_name": "addon",
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "D:/Qt/5.10.0/msvc2017_64/include/",
                "D:/Qt/5.10.0/msvc2017_64/include/QtCore",
                "D:/Qt/5.10.0/msvc2017_64/include/QtGui",
                "D:/Qt/5.10.0/msvc2017_64/include/QtWidgets"
              ],
            "sources": [
              "addon.cc"
            ],
            "link_settings": {
              "libraries": [
                "D:/Qt/5.10.0/msvc2017_64/lib/libEGL.lib",
                "D:/Qt/5.10.0/msvc2017_64/lib/libGLESv2.lib",
                "D:/Qt/5.10.0/msvc2017_64/lib/Qt5Core.lib",
                "D:/Qt/5.10.0/msvc2017_64/lib/Qt5Gui.lib",
                "D:/Qt/5.10.0/msvc2017_64/lib/Qt5Widgets.lib"
              ],
            },
          }
        ]
      }
    ]
  ]
}
