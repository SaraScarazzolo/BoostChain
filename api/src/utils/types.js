export interface Block {
    email: string;
    description: string;
    waiting: boolean;
    upvotes: number;
    uuid: string;
}

export interface JSONDB {
    dbPath: string;
    addBlock: (entry: Block) => Promise<void>;
    upvoteBlock: (uuid: string) => Promise<Block>;
    approveBlock: (uuid: string) => Promise<Block>;
    initDB: () => Promise<void>;
    read: () => Promise<Block[]>;
}
