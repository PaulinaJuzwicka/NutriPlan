// Używamy dynamicznego importu, aby załadować ciężką bibliotekę tylko wtedy, gdy jest potrzebna
let htmlToDocx: any = null;

// Funkcja do ładowania biblioteki html-to-docx
const loadHtmlToDocx = async () => {
  if (!htmlToDocx) {
    const module = await import('html-to-docx');
    htmlToDocx = module.default || module;
  }
  return htmlToDocx;
};

import * as path from 'path';
import * as fs from 'fs/promises';
import { ensureOutputDir } from './save-diet-plan-simple';
import { 
  DietPlan, 
  Nutrient, 
  SaveDietPlanOptions, 
  SaveDietPlanResult,
  GenerateHTMLOptions
} from './types/diet-plan';

const DEFAULT_OUTPUT_DIR = path.join(process.cwd(), 'public', 'diet-plans');

/**
 * Logs an error with timestamp and optional context
 * @param error - Error object or message
 * @param context - Additional context for the error
 * @returns Object containing error details
 */
const logError = (error: unknown, context: string = ''): { error: string; stack?: string } => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  
  
  return { 
    error: errorMessage, 
    ...(process.env.NODE_ENV === 'development' && { stack })
  };
};

/**
 * Safely gets a nested property from an object
 * @param obj - Object to get the property from
 * @param path - Dot-separated path to the property
 * @param defaultValue - Default value if property doesn't exist
 * @returns The property value or default value
 */
const safeGet = <T extends Record<string, unknown>>(obj: T, path: string, defaultValue: T): T => {
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : defaultValue), obj);
};

/**
 * Formats nutrients into HTML
 * @param nutrients - Array of nutrients
 * @returns Formatted HTML string
 */
const formatNutrients = (nutrients: Nutrient[] = []): string => {
  if (!nutrients || !Array.isArray(nutrients) || nutrients.length === 0) {
    return '';
  }
  
  return `
    <div class="nutrients">
      <h4>Wartości odżywcze (na porcję):</h4>
      <ul>
        ${nutrients.map(nutrient => 
          `<li>${nutrient.name || 'Wartość odżywcza'}: ${nutrient.amount || '0'} ${nutrient.unit || 'g'}</li>`
        ).join('')}
      </ul>
    </div>
  `;
};

/**
 * Generates HTML content for a diet plan
 * @param plan - Diet plan data
 * @param options - Additional options for HTML generation
 * @returns HTML string
 */
export const generateHTMLContent = (
  plan: DietPlan, 
  options: GenerateHTMLOptions = {}
): string => {
  const {
    title = 'Plan żywieniowy',
    styles = `
      body { 
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1, h2, h3, h4 { 
        color: #2c3e50;
        margin-top: 1.5em;
      }
      .day-plan { 
        margin-bottom: 2em;
        page-break-inside: avoid;
      }
      .meal { 
        margin-bottom: 1.5em;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 5px;
      }
      .meal h3 { 
        margin-top: 0;
        color: #3498db;
      }
      .ingredients, .instructions { 
        margin: 10px 0;
      }
      .nutrients {
        margin-top: 10px;
        padding: 10px;
        background: #e8f4fc;
        border-radius: 3px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
    `,
    lang = 'pl'
  } = options;

  try {
    const daysHTML = plan.dailyPlans.map(day => `
      <div class="day-plan">
        <h2>${day.day} (${day.date})</h2>
        ${day.meals.map(meal => `
          <div class="meal">
            <h3>${meal.name} - ${meal.time}</h3>
            
            ${meal.ingredients && meal.ingredients.length > 0 ? `
              <div class="ingredients">
                <h4>Składniki:</h4>
                <ul>
                  ${meal.ingredients.map(ing => 
                    `<li>${ing.amount} ${ing.unit} ${ing.name}</li>`
                  ).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${meal.instructions ? `
              <div class="instructions">
                <h4>Sposób przygotowania:</h4>
                <p>${meal.instructions.replace(/\n/g, '<br>')}</p>
              </div>
            ` : ''}
            
            ${formatNutrients(meal.nutrients)}
          </div>
        `).join('')}
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>${styles}</style>
      </head>
      <body>
        <h1>${plan.title}</h1>
        ${plan.description ? `<p>${plan.description}</p>` : ''}
        
        ${daysHTML}
        
        ${plan.totalNutrients ? `
          <div class="total-nutrients">
            <h2>Podsumowanie wartości odżywczych</h2>
            ${formatNutrients(plan.totalNutrients)}
          </div>
        ` : ''}
        
        <footer style="margin-top: 40px; font-size: 0.9em; color: #777; text-align: center;">
          <p>Wygenerowano: ${new Date().toLocaleString('pl-PL')}</p>
        </footer>
      </body>
      </html>
    `;
  } catch (error) {
    throw new Error('Nie udało się wygenerować zawartości HTML');
  }
};

/**
 * Saves a diet plan as a DOCX file
 * @param options - Save options
 * @returns Promise with the save result
 */
// Cache dla wygenerowanej zawartości HTML
const htmlCache = new Map<string, string>();

// Funkcja do generowania klucza cache na podstawie planu
const getCacheKey = (plan: DietPlan): string => {
  return `${plan.title}-${plan.updatedAt || plan.createdAt}`;
};

/**
 * Generuje i zapisuje plan żywieniowy jako plik DOCX
 * @param options - Opcje generowania dokumentu
 * @returns Promise z wynikiem operacji
 */
export const saveDietPlan = async (
  options: SaveDietPlanOptions
): Promise<SaveDietPlanResult> => {
  const {
    plan,
    filename = `diet-plan-${new Date().toISOString().slice(0, 10)}.docx`,
    outputDir = DEFAULT_OUTPUT_DIR,
    forceRegenerate = false
  } = options;

  try {
    // Sprawdzamy, czy mamy już wygenerowaną zawartość w cache
    const cacheKey = getCacheKey(plan);
    let htmlContent: string;
    
    if (!forceRegenerate && htmlCache.has(cacheKey)) {
      // Używamy zawartości z cache
      htmlContent = htmlCache.get(cacheKey)!;
    } else {
      // Generujemy nową zawartość
      htmlContent = generateHTMLContent(plan);
      // Zapisujemy w cache
      htmlCache.set(cacheKey, htmlContent);
    }

    // Ładujemy bibliotekę html-to-docx tylko wtedy, gdy jest potrzebna
    const htmlToDocx = await loadHtmlToDocx();
    
    // Konwertujemy HTML na DOCX
    const fileBuffer = await htmlToDocx({
      html: htmlContent,
      header: `
        <div style="text-align: center; font-size: 12px; color: #666; margin-bottom: 10px;">
          ${plan.title} | Wygenerowano: ${new Date().toLocaleString('pl-PL')}
        </div>
      `,
      footer: `
        <div style="text-align: center; font-size: 10px; color: #999; margin-top: 10px;">
          Strona <span class="pageNumber"></span> z <span class="totalPages"></span>
        </div>
      `,
      pageNumber: true,
    });

    // Tworzymy katalog wyjściowy, jeśli nie istnieje
    await ensureOutputDir(outputDir);
    
    // Zapisujemy plik
    const filePath = path.join(outputDir, filename);
    await fs.writeFile(filePath, fileBuffer);
    
    return {
      success: true,
      filePath
    };
  } catch (error) {
    const errorResult = logError(error, 'saveDietPlan');
    return {
      success: false,
      ...errorResult
    };
  }
};

/**
 * Test function to verify file writing capability
 * @param outputDir - Directory to test writing in
 * @returns Promise with test result
 */
export const testFileWrite = async (outputDir: string = DEFAULT_OUTPUT_DIR): Promise<boolean> => {
  try {
    await ensureOutputDir(outputDir);
    const testFilePath = path.join(outputDir, 'test-file.txt');
    await fs.writeFile(testFilePath, 'Testowa zawartość pliku', 'utf8');
    return true;
  } catch (error) {
    logError(error, 'testFileWrite');
    return false;
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testFileWrite()
  }

export default {
  generateHTMLContent,
  saveDietPlan,
  testFileWrite,
  DEFAULT_OUTPUT_DIR
};
