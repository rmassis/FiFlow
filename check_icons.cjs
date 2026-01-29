
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const rootDir = 'c:/Users/rodri/OneDrive/Documents/FiFlow/src/react-app';
const files = walk(rootDir);
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');

    // Find used components <SomeComponent
    const usedMatches = content.match(/<([A-Z][a-zA-Z0-9]+)/g);
    if (usedMatches) {
        const used = [...new Set(usedMatches.map(m => m.slice(1)))];
        used.forEach(icon => {
            // Ignore common React components or ones that seem to be imported
            if (['DashboardLayout', 'DashboardHeader', 'SummaryCards', 'EvolutionChart', 'ExpensesPieChart', 'TransactionsTable', 'DashboardProvider', 'Router', 'Routes', 'Route', 'Fragment', 'StrictMode', 'App', 'BrowserRouter', 'NavLink', 'Link', 'Navigate', 'Sidebar', 'TransactionFilters', 'TransactionList', 'TransactionDetailModal', 'PersonalDataForm', 'AccountsManager', 'AdvancedDateFilter', 'MobileNav', 'Header', 'Footer', 'MainLayout', 'CategoryManager', 'InsightCard', 'GoalCard', 'ChatMessage'].includes(icon)) return;

            // Check if imported
            const isImported = content.includes(`import { ${icon}`) ||
                content.includes(`, ${icon}`) ||
                content.includes(`${icon}, `) ||
                content.includes(`import ${icon}`) ||
                content.includes(`} from "@/react-app`) || // Assuming local components are imported
                content.includes(`from "lucide-react"`) && content.includes(icon);

            if (!isImported) {
                // Check if defined locally
                const isDefined = content.includes(`function ${icon}`) ||
                    content.includes(`const ${icon} =`);

                if (!isDefined) {
                    console.log(`Suspicious: ${icon} used in ${file} but not clearly imported or defined.`);
                }
            }
        });
    }
});
