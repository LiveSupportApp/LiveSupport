module.exports = {
  /**
   * 使用するソフト
   * BouyomiChan Softalk のどれか一つ
   * @type {String}
   */
  software: '',

  // ソフトークに関する設定
  Softalk: {
    /**
    * Softalk.exeのパス (空欄の場合はプロセスから検索)
    * @type {String}
    */
    path: '',

    /**
    * 音程 (1～300)
    * @type {Number}
    */
    interval: 100,

    /**
    * 読み上げ方 (0～5)
    * 0:平仮名変換なし・抑揚なし
    * 1:平仮名変換なし・抑揚あり
    * 2:平仮名変換あり・抑揚なし
    * 3:平仮名変換あり・抑揚あり
    * 4:平仮名変換あり・抑揚なし・空耳あり
    * 5:平仮名変換あり・抑揚あり・唄詠あり
    * @type {Number}
    */
    quality: 3,

    /**
    * 速度 (1～300)
    * @type {Number}
    */
    speed: 100,

    /**
    * ライブラリ選択 (7～10)
    * 7:AquesTalk
    * 8:SAPI
    * 9:Speech Platform
    * 10:AquesTalk2
    * @type {Number}
    */
    library: 7,

    /**
    * 声選択 (0～?)
    * @type {Number}
    */
    voice: 0,

    /**
     * 音量 (0～100)
     * @type {Number}
     */
    volume: 50,

    /**
     * 非表示 (0～1)
     * false:表示 true:非表示
     * @type {Boolean}
     */
    hide: false,
  },

  // 棒読みちゃんに関する設定
  BouyomiChan: {
    /**
    * RemoteTalk.exeのパス (空欄の場合はプロセスから検索)
    * @type {String}
    */
    path: '',

    /**
    * 速度 (-1:デフォルト、50:最低、300:最高)
    * @type {Number}
    */
    speed: -1,

    /**
    * 音程 (-1:デフォルト、50:最低、200:最高)
    * @type {Number}
    */
    interval: -1,

    /**
     * 音量 (-1:デフォルト、 0:最低、100:最高)
     * @type {Number}
     */
    volume: -1,

    /**
     * 声質 (0:デフォルト、 1:女性1, 2:女性2, 3:男性1, 4:男性2,
     *       5:中性, 6:ロボット, 7:機械1, 8:機械2, 9以降:SAPI  )
     * @type {Number}
     */
    quality: 0,
  },
}
