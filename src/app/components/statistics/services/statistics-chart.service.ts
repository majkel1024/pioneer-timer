import { Injectable } from '@angular/core';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';
import { ServiceEntry } from '../../../models';
import { MonthlyChartData } from '../charts/monthly-chart.component';

@Injectable({
  providedIn: 'root'
})
export class StatisticsChartService {

  constructor(private pioneerService: PioneerTimerService) {}

  generateMonthlyChartData(serviceYear: number, entries: ServiceEntry[]): MonthlyChartData[] {
    const months = [
      'Wrz', 'Paź', 'Lis', 'Gru', 'Sty', 'Lut',
      'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie'
    ];

    return months.map((monthName, index) => {
      let year: number, month: number;
      
      if (index < 4) { // Sept-Dec
        year = serviceYear;
        month = index + 8;
      } else { // Jan-Aug
        year = serviceYear + 1;
        month = index - 4;
      }
      
      const data = this.pioneerService.getMonthHours(year, month, entries);
      return { 
        name: monthName, 
        ...data,
        displayMonth: month,
        displayYear: year
      };
    });
  }
}
