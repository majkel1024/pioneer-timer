import { Injectable } from '@angular/core';
import { PioneerTimerService } from '../../../services/pioneer-timer.service';
import { ServiceEntry, Settings, MonthlyData } from '../../../models';

@Injectable({
  providedIn: 'root'
})
export class StatisticsTextService {

  constructor(private pioneerService: PioneerTimerService) {}

  getYearBreakdownText(serviceYear: number, entries: ServiceEntry[]): string {
    const yearData = this.pioneerService.getServiceYearHours(serviceYear, entries);
    const typeBreakdown: string[] = [];
    
    Object.entries(yearData.breakdown).forEach(([typeId, hours]) => {
      const typeName = this.pioneerService.getHourTypeName(typeId);
      typeBreakdown.push(`${typeName}: ${this.pioneerService.formatTime(hours)}`);
    });
    
    return typeBreakdown.join(' | ');
  }

  getMonthlyBreakdownText(year: number, month: number, entries: ServiceEntry[]): string {
    const breakdown = this.pioneerService.getMonthBreakdown(year, month, entries);
    const typeBreakdown: string[] = [];
    
    Object.entries(breakdown).forEach(([typeId, hours]) => {
      if (hours > 0) {
        const typeName = this.pioneerService.getHourTypeName(typeId);
        typeBreakdown.push(`${typeName}: ${this.pioneerService.formatTime(hours)}`);
      }
    });
    
    return typeBreakdown.length > 0 ? typeBreakdown.join(' | ') : 'Brak wpisów';
  }
}
