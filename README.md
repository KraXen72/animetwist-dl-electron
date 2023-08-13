# Unmaintained - [twist.moe](https://twist.moe) no longer exists  
For alternatives, try:
- Torrenting from nyaa
- Judas Encodes (smaller size), Judas Encodes DDL google drive (find invite in their discord, recommended to use with AirExplorer on win and google drive app on Phone)
- [this gogoanime downloader userscript](https://greasyfork.org/en/scripts/465970-anilink-gogoanime)
- [Aniyomi](https://github.com/aniyomiorg/aniyomi) / [Animiru (Aniyomi fork)](https://github.com/Quickdesh/Animiru)
  
The repo will be still kept as an archive, mostly for the typeahead implementation and youtube-dl integration. See old README below.

# twist.moe / AnimeTwist downloader
an easy to use downloader from twist.moe.  
![img](https://cdn.discordapp.com/attachments/704792091955429426/806973238638542939/Rec_2021_02.04_2042.gif)
## Features
- Downloading high quality anime from https://twist.moe
- Clean material design interface
- [rosebox](https://github.com/KraXen72/rosebox) color scheme
- Search anime (with autocomplete): no need to paste link, just find the anime
- Search the anime in either japanese or english
- Select where will it be downloaded
- Progress on your downloads

## Installation
### Releases
[https://github.com/KraXen72/animetwist-dl-electron/releases](https://github.com/KraXen72/animetwist-dl-electron/releases)

### From source
requirements:
- nodejs - [download](https://nodejs.org/en/)

this downloader uses [youtube-dl](https://youtube-dl.org) to download. it *should* detect if you have it and install it in the background if needed, but if you have problems with downloading anime, (especially on linux), install it yourself with ``pip install youtube-dl``

then:

- install with ``npm install -g animetwist-dl-electron``
- open terminal, rofi, start or anything type ``animetwist``

please report any issues regarding installation in the issues
