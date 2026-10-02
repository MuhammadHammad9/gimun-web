import { THEME_BOOT_SCRIPT } from './theme';

/**
 * The one inline script in <head>: resolves the colour theme, and hides the
 * site notice before first paint for a visitor who already closed it.
 *
 * It is a constant on purpose. The admin's Content Security Policy allows it
 * by its SHA-256 hash (src/proxy.ts), which only works if the text never
 * changes; the notice's storage key therefore travels in a data attribute on
 * <html> instead of being written into the script.
 */
export const NOTICE_KEY_ATTRIBUTE = 'data-notice-key';

const NOTICE_BOOT_SCRIPT = `try{var k=document.documentElement.getAttribute('${NOTICE_KEY_ATTRIBUTE}');if(k&&localStorage.getItem(k)==='true')document.documentElement.dataset.bannerDismissed='1'}catch(e){}`;

export const HEAD_BOOT_SCRIPT = THEME_BOOT_SCRIPT + NOTICE_BOOT_SCRIPT;
