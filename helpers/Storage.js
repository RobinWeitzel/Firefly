import Realm from 'realm';
import API from './API';
import { calcDistance } from './Location';
import { atoBuffer } from './Base64';

const SettingsSchema = {
    name: 'Settings',
    primaryKey: 'id',
    properties: {
        id: 'int',
        url: 'string',
        token: 'string'
    }
};

const BudgetSchema = {
    name: 'Budget',
    primaryKey: 'id',
    properties: {
        id: 'int',
        name: 'string',
        updated: 'date',
    }
}

const AssetSchema = {
    name: 'Asset',
    primaryKey: 'id',
    properties: {
        id: 'int',
        name: 'string',
        updated: 'date',
    }
}

const OtherSchema = {
    name: 'Other',
    primaryKey: 'id',
    properties: {
        id: 'int',
        name: 'string',
        type: 'string',
        updated: 'date',
        preferredAsset: 'Asset',
        preferredBudget: 'Budget',
        locations: { type: 'linkingObjects', objectType: 'Location', property: 'other' }
    }
}

const LocationSchema = {
    name: 'Location',
    properties: {
        lat: 'float',
        lon: 'float',
        other: 'Other'
    }
}

const getLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return lastWeek;
}

export default class Storage {
    constructor(forceUpdate, screen) {
        this.realm = new Realm({
            schema: [BudgetSchema, AssetSchema, OtherSchema, LocationSchema, SettingsSchema],
            schemaVersion: 5,
            migration: (oldRealm, newRealm) => {
                // only apply this change if upgrading to schemaVersion 1
                if (oldRealm.schemaVersion < 2) {
                    const oldObjects = oldRealm.objects('Account');
                    const newObjects = newRealm.objects('Account');

                    // loop through all objects and set the name property in the new schema
                    for (let i = 0; i < oldObjects.length; i++) {
                        newObjects[i].updated = new Date();
                    }
                }

                if (oldRealm.schemaVersion < 5) {
                    const oldObjects = oldRealm.objects('Settings');
                    const newObjects = newRealm.objects('Settings');

                    // loop through all objects and set the name property in the new schema
                    for (let i = 0; i < oldObjects.length; i++) {
                        newObjects[i].id = i;
                    }
                }
            }
        });

        if(forceUpdate) {
            const settings = this.getSettings()

            this.api = new API(settings.url, settings.token);

            this.realm.addListener('change', () => {
                if(!screen._mounted)
                    return;
                forceUpdate();
            });
        }
    }

    getSettings() {
        const settings = this.realm.objectForPrimaryKey('Settings', 1);

        if(settings === undefined)
            return {url: "", token: ""};
        
        return settings
    }

    saveSettings(url, token) {
        this.realm.write(() => {
            this.realm.create('Settings', {id: 1, url: url, token: token}, true);
        });

        this.api = new API(url, token);
    }

    getAssets() {
        const type = 'asset';
        const oldAccounts = this.realm.objects('Asset').filtered('updated < $0', getLastWeek());
        this.realm.write(() => {
            this.realm.delete(oldAccounts);
        });

        this.api.getAccounts({ page: 1, type }).then(result => {
            const totalPages = result.meta.pagination.total_pages;

            for (let i = 1; i < totalPages; i++) {
                this.api.getAccounts({ page: i, type }).then(result => {
                    this.realm.write(() => {
                        for (const account of result.data) {
                            this.realm.create('Asset', { id: parseInt(account.id), name: account.attributes.name, updated: new Date() }, true);
                        }
                    });
                }).catch(e => {});
            }

            this.realm.write(() => {
                for (const account of result.data) {
                    this.realm.create('Asset', { id: parseInt(account.id), name: account.attributes.name, updated: new Date() }, true);
                }
            });
        }).catch(e => {});

        return this.realm.objects('Asset');
    }

    getOthers(type) {
        const oldAccounts = this.realm.objects('Other').filtered('type = $0 AND updated < $1', type, getLastWeek());
        this.realm.write(() => {
            this.realm.delete(oldAccounts);
        });

        this.api.getAccounts({ page: 1, type }).then(result => {
            const totalPages = result.meta.pagination.total_pages;

            for (let i = 1; i < totalPages; i++) {
                this.api.getAccounts({ page: i, type }).then(result => {
                    this.realm.write(() => {
                        for (const account of result.data) {
                            this.realm.create('Other', { id: parseInt(account.id), name: account.attributes.name, type: account.attributes.type, updated: new Date() }, true);
                        }
                    });
                }).catch(e => {});
            }

            this.realm.write(() => {
                for (const account of result.data) {
                    this.realm.create('Other', { id: parseInt(account.id), name: account.attributes.name, type: account.attributes.type, updated: new Date() }, true);
                }
            });
        }).catch(e => {});

        return this.realm.objects('Other').filtered('type = $0', type);
    }


    getAccounts(type) {
        if (type === 'asset')
            return this.getAssets();
        else
            return this.getOthers(type);
    }

    getBudgets() {
        const oldBudgets = this.realm.objects('Budget').filtered('updated < $0', getLastWeek());
        this.realm.write(() => {
            this.realm.delete(oldBudgets);
        });

        this.api.getBudgets({ page: 1 }).then(result => {
            const totalPages = result.meta.pagination.total_pages;

            for (let i = 1; i < totalPages; i++) {
                this.api.getBudgets({ page: i }).then(result => {
                    this.realm.write(() => {
                        for (const budget of result.data) {
                            this.realm.create('Budget', { id: parseInt(budget.id), name: budget.attributes.name, updated: new Date() }, true);
                        }
                    });
                }).catch(e => {});
            }

            this.realm.write(() => {
                for (const budget of result.data) {
                    this.realm.create('Budget', { id: parseInt(budget.id), name: budget.attributes.name, updated: new Date() }, true);
                }
            });
        }).catch(e => {});

        return this.realm.objects('Budget');
    }

    getNearby(lat, lon) {
        return this.realm.objects('Location').filtered('lat > $0 AND lat < $1 AND lon > $2 AND lon < $3', Math.floor(lat * 1000) / 1000, Math.ceil(lat * 1000) / 1000, Math.floor(lon * 1000) / 1000, Math.ceil(lon * 1000) / 1000).map(l => {
            return {
                account: l.other,
                distance: calcDistance({ longitude: lon, latitude: lat }, { longitude: l.lon, latitude: l.lat })
            }
        }).sort((a, b) => {
            let comp = 0;
            if (a.distance > b.distance)
                comp = 1;
            if (b.distance > a.distance)
                comp = -1;

            return comp;
        });
    }

    async saveTransaction(transaction, receipt, other, location) {
        return new Promise(async (resolve, reject) => {
            try {
                const r = await this.api.postTransaction(transaction);

                if(r.errors)
                    return reject(r);

                if(other === undefined)
                    return resolve(r);

                this.realm.write(() => {
                    other = this.realm.create('Other', other, true);

                    if(location !== null) {
                        this.realm.create('Location', {other: other, lat: location.latitude, lon: location.longitude});
                    }
                });

                if (receipt === '')
                    return resolve();;
        
                const id = r.data.attributes.transactions[0].transaction_journal_id;
        
                const attachment = await this.api.postAttachment({
                    filename: 'receipt.jpeg',
                    model: 'TransactionJournal',
                    model_id: id,
                    title: 'Receipt'
                });
                const id2 = attachment.data.id;
                this.api.uploadAttachment(id2, atoBuffer(receipt));
                return resolve();
            } catch(e) {
                reject(e);
            }
        });
    }

    async saveOther(name, type) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.api.postAccount({name, type});
                
                this.realm.write(() => {
                    const other = this.realm.create('Other', { id: parseInt(result.data.id), updated: new Date(), name: result.data.attributes.name, type: result.data.attributes.type}, true);

                    resolve(other);
                });

            } catch(e) {
                reject(e);
            }
        });
    }
}