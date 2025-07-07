const { Client } = require('@notionhq/client');

// Инициализация Notion
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const DATABASE_ID = '229d84b538f68031802bee660a681a2c';

export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id, buyer_email, product_name } = req.body;
    
    // Определяем продукт по названию
    const productMapping = {
      'crm_template': 'CRM шаблон',
      'sales_template': 'Sales шаблон', 
      'finance_template': 'Finance шаблон',
      'project_template': 'Project шаблон',
      'hr_template': 'HR шаблон',
      'marketing_template': 'Marketing шаблон'
    };
    
    const productName = productMapping[product_name] || product_name;
    
    // Определяем группу
    const groupMapping = {
      'CRM шаблон': 'CRM группа',
      'Sales шаблон': 'Sales группа',
      'Finance шаблон': 'Finance группа', 
      'Project шаблон': 'Project группа',
      'HR шаблон': 'HR группа',
      'Marketing шаблон': 'Marketing группа'
    };
    
    const groupName = groupMapping[productName];

    // Создаем запись в Notion
    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        'Номер заказа': {
          title: [{ text: { content: order_id } }]
        },
        'Email покупателя': {
          email: buyer_email
        },
        'Продукт': {
          select: { name: productName }
        },
        'Группа': {
          select: { name: groupName }
        },
        'Дата покупки': {
          date: { start: new Date().toISOString() }
        },
        'Доступ предоставлен': {
          checkbox: false
        },
        'Статус': {
          select: { name: 'Активный' }
        }
      }
    });

    console.log(`✅ Покупатель добавлен: ${buyer_email} - ${productName}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Покупатель добавлен в базу' 
    });

  } catch (error) {
    console.error('❌ Ошибка webhook:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
