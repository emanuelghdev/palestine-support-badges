import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      "Palestine Support Badges": "Palestine Support Badges",
      "Label": "Label",
      "Message": "Message",
      "Color": "Color",
      "Logo": "Logo",
      "Upload logo (SVG)": "Upload logo (SVG)",
      "Select logo": "Select logo",
      "Preview": "Preview",
      "Download PNG": "Download PNG",
      "Copy URL": "Copy URL",
      "Copy Markdown": "Copy Markdown",
      "Copy HTML": "Copy HTML",
      "Save to history": "Save to history",
      "History": "History",
      "Clear history": "Clear history",
      "Language": "Language",
      "No history yet": "No history yet",
      "Use custom logo": "Use custom logo"
    }
  },
  es: {
    translation: {
      "Palestine Support Badges": "Badges de Apoyo a Palestina",
      "Label": "Etiqueta",
      "Message": "Mensaje",
      "Color": "Color",
      "Logo": "Logo",
      "Upload logo (SVG)": "Subir logo (SVG)",
      "Select logo": "Seleccionar logo",
      "Preview": "Previsualizar",
      "Download PNG": "Descargar PNG",
      "Copy URL": "Copiar URL",
      "Copy Markdown": "Copiar Markdown",
      "Copy HTML": "Copiar HTML",
      "Save to history": "Guardar en historial",
      "History": "Historial",
      "Clear history": "Borrar historial",
      "Language": "Idioma",
      "No history yet": "Aún sin historial",
      "Use custom logo": "Usar logo personalizado"
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n