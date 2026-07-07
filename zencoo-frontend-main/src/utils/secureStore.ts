import * as SecureStore from "expo-secure-store";

const JWT_KEY = "jwt";

export async function saveJWT(token: string): Promise<void> {
  await SecureStore.setItemAsync(JWT_KEY, token);
}

export async function getJWT(): Promise<string | null> {
  return SecureStore.getItemAsync(JWT_KEY);
}

export async function deleteJWT(): Promise<void> {
  await SecureStore.deleteItemAsync(JWT_KEY);
}
