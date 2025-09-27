//#region src/index.d.ts
type UserIdentifier = {
  userId?: string;
  userName?: string;
};
type PublicUser = {
  id: string;
  userName?: string;
  metadata?: Record<string, unknown>;
};
//#endregion
export { PublicUser, UserIdentifier };
//# sourceMappingURL=index.d.mts.map