{
  "targets": [
    {
      "target_name": "addon",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "D:/Qt/5.10.0/msvc2017_64/include/",
        "D:/Qt/5.10.0/msvc2017_64/include/QtCore"
      ],
      "sources": [
        "addon.cc"
      ],
      "link_settings": {
        "libraries": [
          "D:/Qt/5.10.0/msvc2017_64/lib/Qt5Core.lib"
        ],
      },
    }
  ]
}
