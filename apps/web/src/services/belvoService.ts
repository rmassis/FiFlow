
// Note: In a production environment, these calls should be made from a backend (Edge Function)
// to avoid exposing credentials. For this demo/tutorial, we are showing the client-side structure.

export class BelvoService {
    private secretId: string;
    private secretPassword: string;
    private baseUrl = '/api/belvo'; // Use Vite proxy to avoid CORS locally

    constructor() {
        this.secretId = import.meta.env.VITE_BELVO_SECRET_ID || '';
        this.secretPassword = import.meta.env.VITE_BELVO_SECRET_PASSWORD || '';
    }

    private getHeaders() {
        const auth = btoa(`${this.secretId}:${this.secretPassword}`);
        return {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        };
    }

    // Generate an access token for the Belvo Connect Widget
    async getAccessToken(): Promise<string> {
        const response = await fetch(`${this.baseUrl}/token/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                id: this.secretId,
                password: this.secretPassword,
                scopes: 'read_institutions,write_links,read_links,read_accounts,read_transactions',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to get Belvo access token:', errorText);
            throw new Error(`Belvo Auth failed: ${response.status}`);
        }

        const data = await response.json();
        return data.access;
    }

    // Fetch accounts associated with the link
    async getAccounts(linkId: string): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/accounts/?link=${linkId}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    }

    // Fetch transactions for those accounts
    async getTransactions(linkId: string, dateFrom: string, dateTo: string): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/transactions/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                link: linkId,
                date_from: dateFrom,
                date_to: dateTo,
            }),
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data;
    }
}

export const belvoService = new BelvoService();
