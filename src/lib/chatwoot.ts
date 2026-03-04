
const BASE_URL = process.env.CHATWOOT_BASE_URL;
const API_TOKEN = process.env.CHATWOOT_API_TOKEN;
const ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
const INBOX_ID = Number(process.env.CHATWOOT_INBOX_ID);

interface ContactData {
    name: string;
    email: string;
    phone: string;
    custom_attributes?: Record<string, any>;
}

export async function createChatwootConversation(data: ContactData) {
    if (!BASE_URL || !API_TOKEN || !ACCOUNT_ID || !INBOX_ID) {
        console.error("Chatwoot credentials missing");
        return null;
    }

    try {
        // 1. Search for contact first to avoid duplicates (by email)
        const searchRes = await fetch(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts/search?q=${encodeURIComponent(data.email)}`, {
            headers: { "api-access-token": API_TOKEN }
        });

        let contactId;
        const searchData = await searchRes.json();

        if (searchData.payload && searchData.payload.length > 0) {
            contactId = searchData.payload[0].id;
        } else {
            // Create Contact
            // Ensure phone has + prefix if missing
            let formattedPhone = data.phone.replace(/\D/g, '');
            if (!formattedPhone.startsWith('57')) formattedPhone = '57' + formattedPhone;
            formattedPhone = '+' + formattedPhone;

            const createRes = await fetch(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/contacts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-access-token": API_TOKEN
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone_number: formattedPhone,
                    custom_attributes: data.custom_attributes
                })
            });

            const createData = await createRes.json();
            if (createData.payload) {
                contactId = createData.payload.contact.id;
            } else {
                console.error("Failed to create contact:", createData);
                return null;
            }
        }

        // 2. Create Conversation
        if (contactId) {
            const convRes = await fetch(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-access-token": API_TOKEN
                },
                body: JSON.stringify({
                    inbox_id: INBOX_ID,
                    contact_id: contactId,
                    status: "open",
                    custom_attributes: data.custom_attributes,
                    additional_attributes: {
                        type: "browser",
                        company_name: "La Herrería Web"
                    }
                })
            });

            const convData = await convRes.json();

            // 3. Create a Message (Internal Note or Incoming Message)
            if (convData.id) {
                await fetch(`${BASE_URL}/api/v1/accounts/${ACCOUNT_ID}/conversations/${convData.id}/messages`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "api-access-token": API_TOKEN
                    },
                    body: JSON.stringify({
                        content: `Nueva Reserva Web:\nID: ${data.custom_attributes?.booking_ref}\nHuéspedes: ${data.custom_attributes?.guests}\nFechas: ${data.custom_attributes?.check_in} - ${data.custom_attributes?.check_out}`,
                        message_type: "incoming",
                        private: false
                    })
                });
            }

            return convData;
        }

    } catch (error) {
        console.error("Error creating Chatwoot conversation", error);
        return null;
    }
}
