import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataManagementComponent } from './data-management.component';
import { By } from '@angular/platform-browser';

describe('DataManagementComponent', () => {
  let component: DataManagementComponent;
  let fixture: ComponentFixture<DataManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataManagementComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit exportShare when Exportuj i udostępnij button clicked', () => {
    spyOn(component.exportShare, 'emit');
    const button = fixture.debugElement.queryAll(By.css('.secondary-btn'))
      .find(btn => btn.nativeElement.textContent.includes('Eksportuj i udostępnij'));
    expect(button).toBeDefined();
    button?.nativeElement.click();
    expect(component.exportShare.emit).toHaveBeenCalled();
  });
});
