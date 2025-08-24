/**
 * Definisi tipe terkait pesan yang disimpan di database.
 */

/* Interface untuk data pesan yang disimpan di database. */
export interface StoredMessage {
  id: string;
  name: string;
  content: string;
  points: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
