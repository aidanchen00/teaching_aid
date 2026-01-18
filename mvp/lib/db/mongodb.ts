// In-memory storage - no database needed
// Data is stored in memory and will be reset on server restart

type Document = Record<string, unknown>;

// In-memory collections
const collections: Map<string, Document[]> = new Map();

// Get or create a collection
function getCollection(name: string): Document[] {
  if (!collections.has(name)) {
    collections.set(name, []);
  }
  return collections.get(name)!;
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Compatibility alias for ObjectId
export const ObjectId = {
  createFromHexString: (hex: string) => hex,
};

// Store a document
export async function storeDocument<T extends object>(
  collection: string,
  document: T
): Promise<string> {
  const col = getCollection(collection);
  const id = generateId();
  col.push({
    ...document,
    _id: id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return id;
}

// Database-like interface for compatibility
export async function getDb() {
  return {
    collection: (name: string) => ({
      find: (query: Document = {}) => ({
        sort: (_sort: Document) => ({
          limit: (limit: number) => ({
            toArray: async () => {
              const col = getCollection(name);
              let results = col.filter((doc) =>
                Object.entries(query).every(([k, v]) => doc[k] === v)
              );
              // Sort by updatedAt descending
              results.sort((a, b) => {
                const aDate = a.updatedAt as Date;
                const bDate = b.updatedAt as Date;
                return bDate.getTime() - aDate.getTime();
              });
              return results.slice(0, limit);
            },
          }),
          toArray: async () => {
            const col = getCollection(name);
            let results = col.filter((doc) =>
              Object.entries(query).every(([k, v]) => doc[k] === v)
            );
            results.sort((a, b) => {
              const aDate = a.updatedAt as Date;
              const bDate = b.updatedAt as Date;
              return bDate.getTime() - aDate.getTime();
            });
            return results;
          },
        }),
        project: (_proj: Document) => ({
          sort: (_sort: Document) => ({
            limit: (limit: number) => ({
              toArray: async () => {
                const col = getCollection(name);
                let results = col.filter((doc) =>
                  Object.entries(query).every(([k, v]) => doc[k] === v)
                );
                results.sort((a, b) => {
                  const aDate = a.updatedAt as Date;
                  const bDate = b.updatedAt as Date;
                  return bDate.getTime() - aDate.getTime();
                });
                return results.slice(0, limit);
              },
            }),
          }),
        }),
        toArray: async () => {
          const col = getCollection(name);
          return col.filter((doc) =>
            Object.entries(query).every(([k, v]) => doc[k] === v)
          );
        },
      }),
      findOne: async (query: Document) => {
        const col = getCollection(name);
        return col.find((doc) =>
          Object.entries(query).every(([k, v]) => doc[k] === v)
        ) || null;
      },
      insertOne: async (doc: Document) => {
        const col = getCollection(name);
        const id = generateId();
        col.push({ ...doc, _id: id });
        return { insertedId: id };
      },
      updateOne: async (
        query: Document,
        update: { $set?: Document; $push?: Document },
        options?: { upsert?: boolean }
      ) => {
        const col = getCollection(name);
        const index = col.findIndex((doc) =>
          Object.entries(query).every(([k, v]) => doc[k] === v)
        );

        if (index === -1) {
          if (options?.upsert) {
            const id = generateId();
            col.push({
              ...query,
              ...(update.$set || {}),
              _id: id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            return { matchedCount: 0, modifiedCount: 1 };
          }
          return { matchedCount: 0, modifiedCount: 0 };
        }

        // Handle $set
        if (update.$set) {
          Object.assign(col[index], update.$set);
        }

        // Handle $push
        if (update.$push) {
          for (const [field, value] of Object.entries(update.$push)) {
            if (!Array.isArray(col[index][field])) {
              col[index][field] = [];
            }
            (col[index][field] as unknown[]).push(value);
          }
        }

        col[index].updatedAt = new Date();
        return { matchedCount: 1, modifiedCount: 1 };
      },
      deleteOne: async (query: Document) => {
        const col = getCollection(name);
        const index = col.findIndex((doc) =>
          Object.entries(query).every(([k, v]) => doc[k] === v)
        );
        if (index !== -1) {
          col.splice(index, 1);
          return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
      },
      deleteMany: async (query: Document) => {
        const col = getCollection(name);
        const before = col.length;
        const filtered = col.filter(
          (doc) => !Object.entries(query).every(([k, v]) => doc[k] === v)
        );
        collections.set(name, filtered);
        return { deletedCount: before - filtered.length };
      },
    }),
  };
}

// File storage (in-memory)
const files: Map<string, { buffer: Buffer; metadata: Record<string, unknown> }> = new Map();

export async function storeFile(
  filename: string,
  buffer: Buffer,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  const id = generateId();
  files.set(id, { buffer, metadata: { ...metadata, filename } });
  return id;
}

export async function getFile(fileId: string): Promise<Buffer> {
  const file = files.get(fileId);
  if (!file) throw new Error(`File not found: ${fileId}`);
  return file.buffer;
}

export async function getFileByName(filename: string): Promise<Buffer> {
  for (const [, file] of files) {
    if (file.metadata.filename === filename) {
      return file.buffer;
    }
  }
  throw new Error(`File not found: ${filename}`);
}

// GridFS bucket stub (not needed but kept for compatibility)
export async function getGridFSBucket() {
  return null;
}
