import fs from 'node:fs/promises';
import { Block, JSONDB } from './types.js';
import { UPVOTES_FOR_CONFIRMATION } from './constants.js';

export default class JSONDatabase implements JSONDB {
    dbPath: string;

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }

    addBlock = async (block: Block): Promise<void> => {
        await this.initDB();

        const data = await this.read();
        data.push(block);

        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 4));
    };

    upvoteBlock = async (uuid: string): Promise<Block> => {
        await this.initDB();

        let data = await this.read();

        let block: Block | null = null;
        data = data.map((b) => {
            if (b.uuid === uuid) {
                block = { ...b, upvotes: b.upvotes + 1 };
                return block;
            }
            return b;
        });

        if (!block) throw new Error('Cannot find block with UUID ' + uuid);
        block = block as Block;

        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 4));

        if (block.upvotes >= UPVOTES_FOR_CONFIRMATION) block = await this.approveBlock(uuid);

        return block as Block;
    };

    approveBlock = async (uuid: string): Promise<Block> => {
        await this.initDB();

        let data = await this.read();

        let block: Block | null = null;
        data = data.map((b) => {
            if (b.uuid === uuid) {
                block = { ...b, waiting: false };
                return block;
            }
            return b;
        });

        if (!block) throw new Error('Cannot find block with UUID ' + uuid);

        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 4));

        return block as Block;
    };

    initDB = async (): Promise<void> => {
        try {
            await fs.access(this.dbPath);
        } catch (err: any) {
            if (err.code === 'ENOENT') await fs.writeFile(this.dbPath, '[]');
            else console.error(`Error creating database '${this.dbPath}':`, err);
        }
    };

    read = async (): Promise<Block[]> => {
        await this.initDB();
        return JSON.parse(await fs.readFile(this.dbPath, 'utf8')) as Block[];
    };
}
