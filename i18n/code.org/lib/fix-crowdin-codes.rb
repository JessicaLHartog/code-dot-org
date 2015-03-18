#! /usr/bin/env ruby
require 'fileutils'

locales = {
  'Albanian' => 'sq-AL',
  'Arabic' => 'ar-SA',
  'Armenian' => 'hy-AM',
  'Azerbaijani' => 'az-AZ',
  'Basque' => 'eu-ES',
  'Bengali' => 'bn-BD',
  'Bosnian' => 'bs-BA',
  'Bulgarian' => 'bg-BG',
  'Catalan' => 'ca-ES',
  'Chinese Simplified' => 'zh-CN',
  'Chinese Traditional' => 'zh-TW',
  'Croatian' => 'hr-HR',
  'Czech' => 'cs-CZ',
  'Danish' => 'da-DK',
  'Dari' => 'fa-AF',
  'Dutch' => 'nl-NL',
  'English' => 'en-US',
  'Estonian' => 'et-EE',
  'Filipino' => 'fil-PH',
  'Finnish' => 'fi-FI',
  'French' => 'fr-FR',
  'Galician' => 'gl-ES',
  'Georgian' => 'ka-GE',
  'German' => 'de-DE',
  'Greek' => 'el-GR',
  'Hebrew' => 'he-IL',
  'Hindi' => 'hi-IN',
  'Hungarian' => 'hu-HU',
  'Icelandic' => 'is-IS',
  'Indonesian' => 'id-ID',
  'Italian' => 'it-IT',
  'Japanese' => 'ja-JP',
  'Khmer' => 'km-KH',
  'Korean' => 'ko-KR',
  'Latvian' => 'lv-LV',
  'Lithuanian' => 'lt-LT',
  'Macedonian (FYROM)' => 'mk-MK',
  'Malay' => 'ms-MY',
  'Maltese' => 'mt-MT',
  'Nepali' => 'ne-NP',
  'Norwegian' => 'no-NO',
  'Norwegian Nynorsk' => 'nn-NO',
  'Pashto' => 'ps-AF',
  'Persian' => 'fa-IR',
  'Polish' => 'pl-PL',
  'Portuguese' => 'pt-PT',
  'Portuguese, Brazilian' => 'pt-BR',
  'Romanian' => 'ro-RO',
  'Russian' => 'ru-RU',
  'Serbian (Cyrillic)' => 'sr-SP',
  'Slovak' => 'sk-SK',
  'Slovenian' => 'sl-SI',
  'Spanish' => 'es-ES',
  'Spanish, Argentina' => 'es-AR',
  'Swedish' => 'sv-SE',
  'Tamil' => 'ta-IN',
  'Thai' => 'th-TH',
  'Turkish' => 'tr-TR',
  'Ukrainian' => 'uk-UA',
  'Urdu (Pakistan)' => 'ur-PK',
  'Vietnamese' => 'vi-VN'
}

locales.each_pair do |language, locale|
  FileUtils.cp_r "../locales/#{language}/.", "../locales/#{locale}"
  FileUtils.rm_r "../locales/#{language}"
end
