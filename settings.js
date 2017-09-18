module.exports = {
  // アプリに関する設定
  app: {
    /**
     * 使用するサービス名
     * twitcasting twitch twitter youtube のどれか一つ
     * @type {String}
     * @example
     * service: 'youtube',
     */
    service: '',

    /**
     * 使用するパッケージの配列
     * @type {String[]}
     */
    package: [
      'default'
    ],
  },


  // ツイキャスに関する設定
  twitcasting: {
    /**
     * 使用するOAuthタイプ名
     * server window のどれか一つ
     * @type {String}
     */
    oauth: '',

    /**
     * コメントの更新間隔 (ms)
     * 注) 1000以下にすると規制がかかります
     * @type {Number}
     */
    timeout: 1000,
  },

  // ツイッチに関する設定
  twitch: {
    /**
     * 使用するOAuthタイプ名
     * server window のどれか一つ
     * @type {String}
     */
    oauth: '',
  },

  // ツイッターに関する設定
  twitter: {
    /**
     * 使用するOAuthタイプ名
     * code server window のどれか一つ
     * @type {String}
     */
    oauth: '',

    /**
     * 検索する文字列 #を先頭につけるとハッシュタグ
     * @type {String}
     */
    hashtag: '',
  },

  // ユーチューブに関する設定
  youtube: {
    /**
     * 使用するOAuthタイプ名
     * code server window のどれか一つ
     * @type {String}
     */
    oauth: '',

    /**
     * チャットを更新する間隔 (ms)
     * @type {Number}
     */
    timeout: 1000,
  },
}
