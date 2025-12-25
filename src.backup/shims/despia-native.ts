// Dev stub for despia-native when running in web
export default async function despia(url: string, args?: any[]) {
  // eslint-disable-next-line no-console
  console.log('[despia-native stub]', url, args);
  return Promise.resolve({ ok: true });
}
(Object.assign(despia, {
  uuid: 'web-dev-uuid',
  onesignalplayerid: 'web-dev-onesignal-id'
}) as any);
